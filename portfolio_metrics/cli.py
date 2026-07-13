from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Sequence

from .config import Settings
from .extract_text import (
    ExtractionFailure,
    build_extract_report,
    extract_documents,
    format_extract_report,
    resolve_pdf_inputs,
)
from .pipeline import normalize_parser_output
from .publish import (
    LEGACY_RESULT_EXCLUDE,
    WrittenPublishArtifacts,
    build_metrics_export,
    write_publish_artifacts,
)
from .schema import MetricsLongExport, NormalizationResult, ParserOutput
from .terminal_ui import failure_line, note_line, phase_status_line, section_heading, warning_line
from . import __version__


@dataclass
class NormalizationFailure:
    input_path: Path
    error: str


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="portfolio-metrics",
        description="CLI for the Sagard portfolio metric extractor.",
    )
    parser.add_argument("--version", action="version",
                        version=f"%(prog)s {__version__}")

    subparsers = parser.add_subparsers(dest="command", required=True)
    preflight_parser = subparsers.add_parser(
        "preflight",
        help="Validate the Phase 1 bootstrap contract without calling external services.",
    )
    preflight_parser.add_argument(
        "--input-dir", default="intake-pdf", help="Directory containing PDF inputs.")
    preflight_parser.add_argument(
        "--output-dir", default="outputs", help="Directory reserved for generated outputs.")
    preflight_parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Choose text for humans or json for automation.",
    )

    extract_parser = subparsers.add_parser(
        "extract",
        help="Run the Phase 2 extraction layer and write parsed JSON + markdown artifacts.",
    )
    extract_parser.add_argument(
        "inputs",
        nargs="*",
        help=(
            "Optional PDF files or directories to parse. If omitted, the command uses the "
            "representative PDFs when available, otherwise all PDFs in --input-dir."
        ),
    )
    extract_parser.add_argument(
        "--input-dir",
        default="intake-pdf",
        help="Directory containing PDF inputs when explicit file arguments are omitted.",
    )
    extract_parser.add_argument(
        "--output-dir",
        default="outputs/parsed",
        help="Directory where parsed JSON and markdown artifacts will be written.",
    )
    extract_parser.add_argument(
        "--parser",
        choices=("firecrawl", "local"),
        default=None,
        help="Override the parser strategy from the environment for this run.",
    )
    extract_parser.add_argument(
        "--no-fallback",
        action="store_true",
        help="Disable automatic fallback from Firecrawl to the local parser.",
    )
    extract_parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Choose text for humans or json for automation.",
    )

    normalize_parser = subparsers.add_parser(
        "normalize",
        help="Run the Phase 3 normalization layer over Phase 2 parsed JSON inputs.",
    )
    normalize_parser.add_argument(
        "inputs",
        nargs="*",
        help=(
            "Optional parsed JSON files or directories. If omitted, the command reads all "
            "`*.parsed.json` files from --input-dir."
        ),
    )
    normalize_parser.add_argument(
        "--input-dir",
        default="outputs/parsed",
        help="Directory containing Phase 2 `*.parsed.json` artifacts when explicit inputs are omitted.",
    )
    normalize_parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Choose text for humans or json for automation.",
    )
    normalize_parser.add_argument(
        "--recall-mode",
        choices=("legacy", "enhanced"),
        default=None,
        help="Recall behavior for this run. Overrides the RECALL_MODE setting (default: enhanced).",
    )

    publish_parser = subparsers.add_parser(
        "publish",
        help="Run the Phase 4 export layer and write canonical metric artifacts.",
    )
    publish_parser.add_argument(
        "inputs",
        nargs="*",
        help=(
            "Optional parsed JSON files or directories. If omitted, the command reads all "
            "`*.parsed.json` files from --input-dir."
        ),
    )
    publish_parser.add_argument(
        "--input-dir",
        default="outputs/parsed",
        help="Directory containing Phase 2 `*.parsed.json` artifacts when explicit inputs are omitted.",
    )
    publish_parser.add_argument(
        "--output-dir",
        default="outputs",
        help="Directory where Phase 4 artifacts such as `metrics_long.json` will be written.",
    )
    publish_parser.add_argument(
        "--include-csv",
        action="store_true",
        help="Also write `metrics_long.csv` as a spreadsheet-friendly review artifact.",
    )
    publish_parser.add_argument(
        "--include-summary",
        action="store_true",
        help="Also write `summary.md` as a lightweight human-readable review artifact.",
    )
    publish_parser.add_argument(
        "--format",
        choices=("text", "json"),
        default="text",
        help="Choose text for humans or json for automation.",
    )
    publish_parser.add_argument(
        "--recall-mode",
        choices=("legacy", "enhanced"),
        default=None,
        help="Recall behavior for this run. Overrides the RECALL_MODE setting (default: enhanced).",
    )
    return parser


def resolve_path(project_root: Path, raw_path: str) -> Path:
    candidate = Path(raw_path)
    if candidate.is_absolute():
        return candidate
    return (project_root / candidate).resolve()


def resolve_parsed_inputs(project_root: Path, input_dir: Path, raw_inputs: Iterable[str]) -> list[Path]:
    requested = list(raw_inputs)
    if requested:
        resolved: list[Path] = []
        for raw_input in requested:
            candidate = Path(raw_input)
            if not candidate.is_absolute():
                project_candidate = (project_root / candidate).resolve()
                input_candidate = (input_dir / candidate).resolve()
                candidate = (
                    input_candidate
                    if not project_candidate.exists() and input_candidate.exists()
                    else project_candidate
                )
            else:
                candidate = candidate.resolve()

            if candidate.is_dir():
                resolved.extend(sorted(path.resolve()
                                for path in candidate.glob("*.parsed.json")))
            else:
                resolved.append(candidate)
        return _dedupe_paths(resolved)

    return sorted(path.resolve() for path in input_dir.glob("*.parsed.json")) if input_dir.is_dir() else []


def build_preflight_report(settings: Settings, input_dir: Path, output_dir: Path) -> dict[str, Any]:
    pdf_names = sorted(path.name for path in input_dir.glob(
        "*.pdf")) if input_dir.is_dir() else []
    warnings: list[str] = []

    if not input_dir.is_dir():
        warnings.append("Input directory is missing.")
    elif not pdf_names:
        warnings.append("Input directory does not contain any PDF files.")

    if not output_dir.is_dir():
        warnings.append("Output directory is missing.")

    if settings.pdf_parser == "firecrawl" and not settings.firecrawl_configured:
        warnings.append(
            "FIRECRAWL_API_KEY is not configured; Phase 2 will fall back to the local parser unless disabled."
        )

    if not settings.openai_configured:
        warnings.append(
            "OPENAI_API_KEY is not configured yet; optional AI-assisted steps remain disabled.")

    report = {
        "project_root": str(settings.project_root),
        "input_dir": str(input_dir),
        "input_exists": input_dir.is_dir(),
        "pdf_count": len(pdf_names),
        "sample_pdfs": pdf_names[:5],
        "output_dir": str(output_dir),
        "output_exists": output_dir.is_dir(),
        "pdf_parser": settings.pdf_parser,
        "openai_model": settings.openai_model,
        "openai_configured": settings.openai_configured,
        "firecrawl_configured": settings.firecrawl_configured,
        "azure_document_intelligence_configured": settings.azure_document_intelligence_configured,
        "warnings": warnings,
    }
    report["ready"] = report["input_exists"] and report["output_exists"] and report["pdf_count"] > 0
    return report


def format_preflight_report(report: dict[str, Any]) -> str:
    lines = [
        phase_status_line("Phase 1 preflight", ready=bool(report["ready"])),
        f"Project root: {_display_path(report['project_root'], keep_parts=3)}",
        f"Input directory: {_display_path(report['input_dir'])}",
        f"PDF files discovered: {report['pdf_count']}",
        f"Output directory: {_display_path(report['output_dir'])}",
        f"Parser strategy: {report['pdf_parser']}",
        f"OpenAI model: {report['openai_model']}",
        f"OpenAI configured: {'yes' if report['openai_configured'] else 'no'}",
        f"Firecrawl configured: {'yes' if report['firecrawl_configured'] else 'no'}",
        "Azure Document Intelligence configured: "
        f"{'yes' if report['azure_document_intelligence_configured'] else 'no'}",
    ]

    sample_pdfs = report["sample_pdfs"]
    if sample_pdfs:
        lines.append("")
        lines.append(note_line("Sample PDFs: " +
                     _summarize_items(sample_pdfs, limit=3), tone="cyan"))

    warnings = report["warnings"]
    if warnings:
        lines.append("")
        lines.append(section_heading("Warnings", tone="yellow"))
        lines.extend(warning_line(warning) for warning in warnings)

    return "\n".join(lines)


def normalize_documents(
    parsed_paths: Iterable[Path],
    *,
    recall_mode: str = "legacy",
) -> tuple[list[NormalizationResult], list[NormalizationFailure]]:
    results: list[NormalizationResult] = []
    failures: list[NormalizationFailure] = []

    for parsed_path in parsed_paths:
        if not parsed_path.is_file():
            failures.append(
                NormalizationFailure(
                    input_path=parsed_path,
                    error="Parsed JSON input is missing.",
                )
            )
            continue

        try:
            payload = json.loads(parsed_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            failures.append(NormalizationFailure(
                input_path=parsed_path, error=str(exc)))
            continue

        try:
            parser_output = ParserOutput.model_validate(payload)
        except Exception as exc:
            failures.append(
                NormalizationFailure(
                    input_path=parsed_path,
                    error=(
                        f"{parsed_path.name} does not match the Phase 2 parser contract: {exc}"
                    ),
                )
            )
            continue

        results.append(normalize_parser_output(
            parser_output, recall_mode=recall_mode))

    return results, failures


def build_normalize_report(
    *,
    input_dir: Path,
    results: Iterable[NormalizationResult],
    failures: Iterable[NormalizationFailure],
    recall_mode: str = "legacy",
) -> dict[str, object]:
    result_list = list(results)
    failure_list = list(failures)
    # Recall-fix (Phase 0): gate the §A fields on this second JSON surface too, so
    # `normalize --format json` in legacy stays byte-identical to the pre-change 1.0.0 report.
    result_exclude = None if recall_mode == "enhanced" else LEGACY_RESULT_EXCLUDE
    return {
        "input_dir": str(input_dir),
        "processed_count": len(result_list),
        "failure_count": len(failure_list),
        "results": [
            result.model_dump(mode="json", exclude=result_exclude)
            for result in result_list
        ],
        "failures": [
            {"input_path": str(item.input_path), "error": item.error}
            for item in failure_list
        ],
        "ready": bool(result_list) and not failure_list,
    }


def format_normalize_report(report: dict[str, object]) -> str:
    lines = [
        phase_status_line("Phase 3 normalization",
                          ready=bool(report["ready"])),
        f"Parsed input directory: {report['input_dir']}",
        f"Documents processed: {report['processed_count']}",
        f"Failures: {report['failure_count']}",
    ]

    results = report.get("results")
    if isinstance(results, list) and results:
        lines.append("")
        lines.append(section_heading("Results"))
        for item in results:
            if not isinstance(item, dict):
                continue

            metrics = item.get("metrics") if isinstance(
                item.get("metrics"), list) else []
            issues = item.get("issues") if isinstance(
                item.get("issues"), list) else []
            valid_metric_count = sum(
                1 for metric in metrics if isinstance(metric, dict) and metric.get("is_valid")
            )
            companies = item.get("companies") if isinstance(
                item.get("companies"), list) else []
            lines.append(
                "- "
                f"{item.get('source_file', 'unknown')} -> "
                f"type={item.get('document_type', 'unknown')}, "
                f"companies={', '.join(str(company) for company in companies) or 'n/a'}, "
                f"valid_metrics={valid_metric_count}/{len(metrics)}, issues={len(issues)}"
            )

            missing_core = _summarize_missing_core_metrics(issues)
            if missing_core:
                lines.append(
                    note_line(f"missing core metrics: {missing_core}", tone="magenta"))

    failures = report.get("failures")
    if isinstance(failures, list) and failures:
        lines.append("")
        lines.append(section_heading("Failures", tone="red"))
        for item in failures:
            if not isinstance(item, dict):
                continue
            lines.append(failure_line(
                f"{item.get('input_path')}: {item.get('error')}"))

    return "\n".join(lines)


def build_publish_report(
    *,
    input_dir: Path,
    output_dir: Path,
    export: MetricsLongExport | None,
    written: WrittenPublishArtifacts | None,
    failures: Iterable[NormalizationFailure],
) -> dict[str, object]:
    failure_list = list(failures)
    metadata = export.export_metadata if export is not None else None
    artifacts: dict[str, str] = {}
    if written is not None:
        artifacts["json_output"] = str(written.json_path)
        if written.csv_path is not None:
            artifacts["csv_output"] = str(written.csv_path)
        if written.summary_path is not None:
            artifacts["summary_output"] = str(written.summary_path)

    return {
        "input_dir": str(input_dir),
        "output_dir": str(output_dir),
        "processed_count": metadata.document_count if metadata is not None else 0,
        "failure_count": len(failure_list),
        "metric_count": metadata.metric_count if metadata is not None else 0,
        "valid_metric_count": metadata.valid_metric_count if metadata is not None else 0,
        "invalid_metric_count": metadata.invalid_metric_count if metadata is not None else 0,
        "issue_count": metadata.issue_count if metadata is not None else 0,
        "schema_version": metadata.schema_version if metadata is not None else None,
        "generated_at": (
            metadata.generated_at.isoformat() if metadata is not None else None
        ),
        "source_parsed_artifacts": (
            metadata.source_parsed_artifacts if metadata is not None else []
        ),
        "artifacts": artifacts,
        "failures": [
            {"input_path": str(item.input_path), "error": item.error}
            for item in failure_list
        ],
        "ready": metadata is not None and metadata.document_count > 0 and not failure_list,
    }


def format_publish_report(report: dict[str, object]) -> str:
    lines = [
        phase_status_line("Phase 4 publish", ready=bool(report["ready"])),
        f"Parsed input directory: {_display_path(report['input_dir'])}",
        f"Artifact directory: {_display_path(report['output_dir'])}",
        f"Documents processed: {report['processed_count']}",
        f"Failures: {report['failure_count']}",
        (
            "Metrics exported: "
            f"{report['metric_count']} ({report['valid_metric_count']} valid, {report['invalid_metric_count']} invalid)"
        ),
        f"Issues carried forward: {report['issue_count']}",
    ]

    if report.get("schema_version"):
        lines.append(f"Schema version: {report['schema_version']}")

    source_parsed_artifacts = report.get("source_parsed_artifacts")
    if isinstance(source_parsed_artifacts, list) and source_parsed_artifacts:
        sample = _summarize_items(source_parsed_artifacts, limit=3)
        lines.append(note_line(
            f"Source parsed artifacts: {len(source_parsed_artifacts)} total"
            + (f" — {sample}" if sample else ""),
            tone="cyan",
        ))

    artifacts = report.get("artifacts")
    if isinstance(artifacts, dict) and artifacts:
        lines.append("")
        lines.append(section_heading("Artifacts"))
        for key in ("json_output", "csv_output", "summary_output"):
            if key in artifacts:
                label = key.replace("_", " ").replace(" output", "")
                lines.append(f"  • {label}: {_display_path(artifacts[key])}")

    failures = report.get("failures")
    if isinstance(failures, list) and failures:
        if lines and lines[-1] != "":
            lines.append("")
        lines.append(section_heading("Failures", tone="red"))
        for item in failures:
            if not isinstance(item, dict):
                continue
            lines.append(failure_line(
                f"{_display_path(item.get('input_path'))}: {item.get('error')}"))

    return "\n".join(lines)


def _display_path(raw_path: object, *, keep_parts: int = 2) -> str:
    text = str(raw_path)
    path = Path(text)
    if path.name and len(path.parts) >= keep_parts:
        return "/".join(path.parts[-keep_parts:])
    return path.name or text


def _summarize_items(items: Iterable[object], *, limit: int) -> str:
    values = [str(item) for item in items]
    if not values:
        return ""
    head = values[:limit]
    remaining = len(values) - len(head)
    suffix = f" (+{remaining} more)" if remaining > 0 else ""
    return ", ".join(head) + suffix


def _summarize_missing_core_metrics(issues: list[object]) -> str:
    missing_by_company: dict[str, list[str]] = {}
    for issue in issues:
        if not isinstance(issue, dict) or issue.get("code") != "missing_metric":
            continue

        company = str(issue.get("company_name") or "unknown")
        canonical_metric = issue.get("canonical_metric")
        if canonical_metric is None:
            continue
        missing_by_company.setdefault(
            company, []).append(str(canonical_metric))

    if not missing_by_company:
        return ""

    if len(missing_by_company) == 1:
        metrics = sorted(set(next(iter(missing_by_company.values()))))
        return ", ".join(metrics)

    return "; ".join(
        f"{company}: {', '.join(sorted(set(metrics)))}"
        for company, metrics in sorted(missing_by_company.items())
    )


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    settings = Settings()

    if args.command == "preflight":
        input_dir = resolve_path(settings.project_root, args.input_dir)
        output_dir = resolve_path(settings.project_root, args.output_dir)
        report = build_preflight_report(
            settings=settings, input_dir=input_dir, output_dir=output_dir)

        if args.format == "json":
            print(json.dumps(report, indent=2, sort_keys=True))
        else:
            print(format_preflight_report(report))

        return 0 if report["ready"] else 1

    if args.command == "extract":
        input_dir = resolve_path(settings.project_root, args.input_dir)
        output_dir = resolve_path(settings.project_root, args.output_dir)
        pdf_paths = resolve_pdf_inputs(
            settings.project_root, input_dir, args.inputs)

        written: list[Any] = []
        failures: list[ExtractionFailure] = []
        if not pdf_paths:
            failures.append(
                ExtractionFailure(
                    input_path=input_dir,
                    error="No PDF inputs were resolved from the provided arguments.",
                )
            )
        else:
            written, failures = extract_documents(
                settings=settings,
                pdf_paths=pdf_paths,
                output_dir=output_dir,
                parser_name=args.parser,
                allow_fallback=not args.no_fallback,
            )

        report = build_extract_report(
            requested_parser=args.parser or settings.pdf_parser,
            output_dir=output_dir,
            written=written,
            failures=failures,
        )

        if args.format == "json":
            print(json.dumps(report, indent=2, sort_keys=True))
        else:
            print(format_extract_report(report))

        return 0 if report["ready"] else 1

    if args.command == "normalize":
        input_dir = resolve_path(settings.project_root, args.input_dir)
        parsed_paths = resolve_parsed_inputs(
            settings.project_root, input_dir, args.inputs)
        recall_mode = args.recall_mode or settings.recall_mode

        results: list[NormalizationResult] = []
        failures: list[NormalizationFailure] = []
        if not parsed_paths:
            failures.append(
                NormalizationFailure(
                    input_path=input_dir,
                    error="No parsed JSON inputs were resolved from the provided arguments.",
                )
            )
        else:
            results, failures = normalize_documents(
                parsed_paths, recall_mode=recall_mode)

        report = build_normalize_report(
            input_dir=input_dir,
            results=results,
            failures=failures,
            recall_mode=recall_mode,
        )

        if args.format == "json":
            print(json.dumps(report, indent=2, sort_keys=True))
        else:
            print(format_normalize_report(report))

        return 0 if report["ready"] else 1

    if args.command == "publish":
        input_dir = resolve_path(settings.project_root, args.input_dir)
        output_dir = resolve_path(settings.project_root, args.output_dir)
        parsed_paths = resolve_parsed_inputs(
            settings.project_root, input_dir, args.inputs)
        recall_mode = args.recall_mode or settings.recall_mode

        results: list[NormalizationResult] = []
        failures: list[NormalizationFailure] = []
        export: MetricsLongExport | None = None
        written: WrittenPublishArtifacts | None = None

        if not parsed_paths:
            failures.append(
                NormalizationFailure(
                    input_path=input_dir,
                    error="No parsed JSON inputs were resolved from the provided arguments.",
                )
            )
        else:
            results, failures = normalize_documents(
                parsed_paths, recall_mode=recall_mode)

        if results:
            export = build_metrics_export(
                results=results, parsed_paths=parsed_paths, recall_mode=recall_mode)
            try:
                written = write_publish_artifacts(
                    export,
                    output_dir,
                    include_csv=args.include_csv,
                    include_summary=args.include_summary,
                )
            except OSError as exc:
                failures.append(
                    NormalizationFailure(
                        input_path=output_dir,
                        error=f"Could not write Phase 4 artifacts: {exc}",
                    )
                )

        report = build_publish_report(
            input_dir=input_dir,
            output_dir=output_dir,
            export=export,
            written=written,
            failures=failures,
        )

        if args.format == "json":
            print(json.dumps(report, indent=2, sort_keys=True))
        else:
            print(format_publish_report(report))

        return 0 if report["ready"] else 1

    parser.error(f"Unsupported command: {args.command}")


def run() -> None:
    raise SystemExit(main())


def _dedupe_paths(paths: Iterable[Path]) -> list[Path]:
    deduped: list[Path] = []
    seen: set[Path] = set()
    for path in paths:
        resolved = path.resolve()
        if resolved in seen:
            continue
        seen.add(resolved)
        deduped.append(resolved)
    return deduped
