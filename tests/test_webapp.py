"""Tests for the local cockpit API (portfolio_metrics/webapp.py).

H6 isolation: `pytest.importorskip("flask")` is the FIRST executable line, so without
the `web` extra installed these tests are SKIPPED and pytest never imports `webapp`
(which imports Flask). That keeps the 95-test baseline collectable + flask-free; with
`.[web]` installed, these run and take the suite to 98.
"""

from __future__ import annotations

import shutil
from pathlib import Path

import pytest

pytest.importorskip("flask")

from portfolio_metrics.webapp import (  # noqa: E402 — must follow the importorskip guard
    create_app,
    list_intake_reports,
    run_pipeline_in_memory,
)

REPO_ROOT = Path(__file__).resolve().parent.parent
INTAKE_DIR = REPO_ROOT / "intake-pdf"

# The current committed corpus (verified live, fully offline). See §A.2 / 00-foundations.md.
EXPECTED_DOCS = 24
EXPECTED_METRICS = 116
EXPECTED_COMPANIES = 10


def _copy_corpus(dst: Path) -> list[Path]:
    """Copy the real intake PDFs into an isolated dir so a test can add/remove files."""

    dst.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(INTAKE_DIR.glob("*.pdf"))
    for pdf in pdfs:
        shutil.copy(pdf, dst / pdf.name)
    return pdfs


def test_offline_run_returns_enhanced_1_1_0_export() -> None:
    """The in-memory offline chain yields the 1.1.0 enhanced export over the full corpus."""

    export = run_pipeline_in_memory(INTAKE_DIR, recall_mode="enhanced")
    payload = export.model_dump(mode="json")
    meta = payload["export_metadata"]

    assert meta["schema_version"] == "1.1.0"
    assert meta["recall_mode"] == "enhanced"
    assert meta["document_count"] == EXPECTED_DOCS
    assert meta["metric_count"] == EXPECTED_METRICS
    # Relational invariant: the count header always matches the actual row list.
    assert meta["metric_count"] == len(payload["metrics"])
    companies = {row["company_name"] for row in payload["metrics"]}
    assert len(companies) == EXPECTED_COMPANIES


def test_run_endpoint_and_reports_list() -> None:
    """POST /api/run returns §A.2; GET /api/reports lists the intake PDFs (§A.1)."""

    client = create_app().test_client()

    run = client.post("/api/run")
    assert run.status_code == 200
    body = run.get_json()
    assert body["schema_version"] == "1.1.0"
    assert body["parsed"] == body["total"] == EXPECTED_DOCS
    assert body["export"]["export_metadata"]["metric_count"] == EXPECTED_METRICS

    reports = client.get("/api/reports").get_json()
    assert reports["count"] == EXPECTED_DOCS
    assert reports["intake_dir"] == "intake-pdf"
    # Sorted, name-only file list — rendered before any processing (success criterion #7).
    assert reports["reports"] == sorted(reports["reports"])
    assert all(name.endswith(".pdf") and "/" not in name for name in reports["reports"])


def test_g1_add_remove_pdf_moves_parsed_and_total(tmp_path: Path) -> None:
    """G1 proof: the explicit-inputs path processes ALL PDFs (not the 3-file cap), and
    adding/removing a PDF moves parsed/total on the next run."""

    intake = tmp_path / "intake-pdf"
    pdfs = _copy_corpus(intake)
    client = create_app(intake_dir=intake).test_client()

    full = client.post("/api/run").get_json()
    # If REPRESENTATIVE_PDFS had leaked in, this would be 3. G1 = it is the full corpus.
    assert full["parsed"] == full["total"] == len(pdfs)
    assert len(pdfs) == EXPECTED_DOCS

    # Remove one PDF -> the next run reflects one fewer found AND parsed.
    (intake / pdfs[0].name).unlink()
    fewer = client.post("/api/run").get_json()
    assert fewer["total"] == len(pdfs) - 1
    assert fewer["parsed"] == len(pdfs) - 1


def test_corrupt_pdf_degrades_without_500(tmp_path: Path) -> None:
    """A single unreadable PDF is skipped: parsed < total, and the route still returns 200."""

    intake = tmp_path / "intake-pdf"
    pdfs = _copy_corpus(intake)
    (intake / "zzz_corrupt.pdf").write_bytes(b"this is not a valid pdf file")
    client = create_app(intake_dir=intake).test_client()

    resp = client.post("/api/run")
    assert resp.status_code == 200  # never a 500 for one bad file (§A.2 rollback posture)
    data = resp.get_json()
    assert data["total"] == len(pdfs) + 1  # the corrupt file is FOUND
    assert data["parsed"] == len(pdfs)  # but not parsed
    assert data["parsed"] < data["total"]


def test_metrics_endpoint_null_before_any_run(monkeypatch: pytest.MonkeyPatch) -> None:
    """GET /api/metrics returns {"export": null} before any run this process (§A.3).

    _LATEST_EXPORT is a module-level cache; force it to None so the null branch is
    exercised regardless of test order (an earlier test may have populated it).
    """

    import portfolio_metrics.webapp as webapp_mod

    monkeypatch.setattr(webapp_mod, "_LATEST_EXPORT", None)
    resp = create_app().test_client().get("/api/metrics")
    assert resp.status_code == 200
    assert resp.get_json()["export"] is None


def test_metrics_endpoint_returns_cached_export_after_run() -> None:
    """After a run, GET /api/metrics returns the cached enhanced export (§A.3)."""

    client = create_app().test_client()
    client.post("/api/run")
    after = client.get("/api/metrics").get_json()
    assert after["export"] is not None
    assert after["export"]["export_metadata"]["schema_version"] == "1.1.0"


def test_normalize_failure_degrades_without_500(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """A PDF that parses but fails NORMALIZATION is also skipped: parsed < total, 200.

    Complements the corrupt-PDF (parse-failure) test — proves the "never 500 for one
    bad PDF" guarantee also covers a downstream normalization error (§A.2)."""

    import portfolio_metrics.webapp as webapp_mod

    intake = tmp_path / "intake-pdf"
    pdfs = _copy_corpus(intake)
    target = pdfs[0].name
    real_normalize = webapp_mod.normalize_parser_output

    def flaky_normalize(parser_output, *, recall_mode):  # type: ignore[no-untyped-def]
        if parser_output.file_name == target:
            raise ValueError("boom during normalization")
        return real_normalize(parser_output, recall_mode=recall_mode)

    monkeypatch.setattr(webapp_mod, "normalize_parser_output", flaky_normalize)
    resp = create_app(intake_dir=intake).test_client().post("/api/run")

    assert resp.status_code == 200  # a normalize failure must not 500 either
    data = resp.get_json()
    assert data["total"] == len(pdfs)
    assert data["parsed"] == len(pdfs) - 1


def test_intake_reports_helper_is_name_only_and_sorted() -> None:
    """list_intake_reports returns sorted base names, never full paths (§A.1)."""

    reports = list_intake_reports(INTAKE_DIR)
    assert reports == sorted(reports)
    assert len(reports) == EXPECTED_DOCS
    assert all("/" not in name for name in reports)
