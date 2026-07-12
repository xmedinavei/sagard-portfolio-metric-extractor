"""Local, offline Flask API that drives the portfolio-metrics pipeline in-memory.

This is the *cockpit* backend for the Sagard case-study demo. It is a deliberately
thin, deletable layer: the CLI and the whole test/golden suite import neither Flask
nor this module, so removing ``webapp.py`` (and ``web/``) leaves the package
byte-identical. Flask is an optional ``web`` extra — importing this module requires
it, but nothing that pytest collects imports this module (see ``tests/test_webapp.py``,
which self-skips when Flask is absent).

Three load-bearing invariants (carried from the Phase-0 build spec, hazards H1-H3):
  * H1 — the library defaults ``recall_mode="legacy"``; every call here passes
    ``"enhanced"`` EXPLICITLY, which yields the 1.1.0 / 23-field export.
  * H2 — "offline" is guaranteed by FORCING ``LocalPdfParser`` (pure pypdf, no network),
    never by relying on missing API keys. ``Settings`` is intentionally not used.
  * H3 — the intake folder is globbed and each PDF passed as an EXPLICIT path, so the
    3-file ``REPRESENTATIVE_PDFS`` cap in ``resolve_pdf_inputs`` never activates.
"""

from __future__ import annotations

import time
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory

from .parser_local import LocalPdfParser
from .pipeline import normalize_parser_output
from .publish import build_metrics_export
from .schema import MetricsLongExport

# The recall mode every library call is given explicitly (H1). Constant, not a Setting.
RECALL_MODE = "enhanced"
# Default intake folder; globbed as intake-pdf/*.pdf (explicit inputs — H3/G1).
INTAKE_DIR = "intake-pdf"
# Repo root = two levels up from this file (portfolio_metrics/webapp.py -> repo/).
_REPO_ROOT = Path(__file__).resolve().parent.parent
# The built React bundle Flask serves same-origin (produced by `make build-web`).
_DIST_DIR = _REPO_ROOT / "web" / "dist"

# Process-lifetime cache of the last successful run, so a page refresh can re-read
# the export without re-running the pipeline. None until POST /api/run has run once.
_LATEST_EXPORT: MetricsLongExport | None = None


def list_intake_reports(intake_dir: Path) -> list[str]:
    """Return the sorted PDF file names found in ``intake_dir`` (name only, no path)."""

    return sorted(pdf.name for pdf in intake_dir.glob("*.pdf"))


def run_pipeline_in_memory(
    intake_dir: Path,
    *,
    recall_mode: str = RECALL_MODE,
) -> MetricsLongExport:
    """Parse -> normalize -> export every PDF in ``intake_dir``, fully in-memory + offline.

    This wiring is intentionally NEW: the CLI's ``normalize_documents`` round-trips through
    disk JSON, so it cannot be reused here. We assemble the chain directly:
    ``LocalPdfParser().parse`` -> ``normalize_parser_output`` -> ``build_metrics_export``.

    A single unreadable/corrupt PDF is skipped (never aborts the run), so the caller can
    surface ``parsed < total`` instead of failing the whole demo.
    """

    parser = LocalPdfParser()
    results = []
    parsed_paths: list[Path] = []
    for pdf in sorted(intake_dir.glob("*.pdf")):
        try:
            parser_output = parser.parse(pdf)
            result = normalize_parser_output(parser_output, recall_mode=recall_mode)
        except Exception:
            # A single bad PDF (parse OR normalize failure) must never crash the run
            # (§A.2): skip it and keep going, so `parsed < total` communicates the
            # degradation to the frontend instead of a 500.
            continue
        # Offline guard (H2): deliberately OUTSIDE the skip-on-error block. A non-local
        # parser is a programming error, not a bad-PDF condition, so it must surface
        # loudly rather than be silently skipped. (We only ever build LocalPdfParser, so
        # in practice this never fires.)
        if parser_output.parser_used != "local":
            raise RuntimeError(
                f"Expected the local (offline) parser for {pdf.name}, "
                f"got {parser_output.parser_used!r}."
            )
        results.append(result)
        parsed_paths.append(Path(pdf.name))

    return build_metrics_export(
        results=results,
        parsed_paths=parsed_paths,
        recall_mode=recall_mode,
    )


def create_app(intake_dir: Path | str = INTAKE_DIR) -> Flask:
    """Flask application factory for the local cockpit API.

    ``static_url_path=""`` serves the built ``web/dist`` bundle (hashed assets) at the
    web root, so Vite's ``base: "./"`` relative asset URLs resolve same-origin with no
    CORS. The ``/api/*`` routes take precedence over the static catch-all.
    """

    intake_path = Path(intake_dir)
    app = Flask(__name__, static_folder=str(_DIST_DIR), static_url_path="")

    @app.get("/api/reports")
    def api_reports():  # noqa: ANN202 — Flask handler
        """§A.1 ReportsResponse — the intake PDFs found *before* any processing."""
        reports = list_intake_reports(intake_path)
        return jsonify(
            {
                "reports": reports,
                "intake_dir": str(intake_path),
                "count": len(reports),
            }
        )

    @app.post("/api/run")
    def api_run():  # noqa: ANN202 — Flask handler
        """§A.2 RunResponse — run the in-memory offline pipeline and cache the export."""
        global _LATEST_EXPORT
        body = request.get_json(silent=True) or {}
        run_dir = Path(body["intake_dir"]) if body.get("intake_dir") else intake_path

        start = time.perf_counter()
        export = run_pipeline_in_memory(run_dir, recall_mode=RECALL_MODE)
        elapsed_s = time.perf_counter() - start

        _LATEST_EXPORT = export
        payload = export.model_dump(mode="json")
        return jsonify(
            {
                "schema_version": payload["export_metadata"]["schema_version"],
                "parsed": payload["export_metadata"]["document_count"],
                "total": len(list_intake_reports(run_dir)),
                "elapsed_s": round(elapsed_s, 3),
                "export": payload,
            }
        )

    @app.get("/api/metrics")
    def api_metrics():  # noqa: ANN202 — Flask handler
        """§A.3 MetricsResponse — the last export, or null if no run happened yet."""
        if _LATEST_EXPORT is None:
            return jsonify({"export": None})
        return jsonify({"export": _LATEST_EXPORT.model_dump(mode="json")})

    @app.get("/")
    def spa_index():  # noqa: ANN202 — Flask handler
        """Serve the SPA shell (web/dist/index.html) same-origin."""
        return send_from_directory(_DIST_DIR, "index.html")

    return app


def main() -> None:
    """Entry point for ``python -m portfolio_metrics.webapp`` (make serve)."""

    create_app().run(host="127.0.0.1", port=5000)


if __name__ == "__main__":
    main()
