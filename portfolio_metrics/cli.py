from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any, Sequence

from .config import Settings
from . import __version__


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="portfolio-metrics",
        description="Bootstrap CLI for the Sagard portfolio metric extractor.",
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
    return parser


def resolve_path(project_root: Path, raw_path: str) -> Path:
    candidate = Path(raw_path)
    if candidate.is_absolute():
        return candidate
    return (project_root / candidate).resolve()


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
            "FIRECRAWL_API_KEY is not configured yet; Phase 2 extraction will need it.")

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
    status = "ready" if report["ready"] else "needs attention"
    lines = [
        f"Phase 1 preflight: {status}",
        f"Project root: {report['project_root']}",
        f"Input directory: {report['input_dir']}",
        f"PDF files discovered: {report['pdf_count']}",
        f"Output directory: {report['output_dir']}",
        f"Parser strategy: {report['pdf_parser']}",
        f"OpenAI model: {report['openai_model']}",
        f"OpenAI configured: {'yes' if report['openai_configured'] else 'no'}",
        f"Firecrawl configured: {'yes' if report['firecrawl_configured'] else 'no'}",
        "Azure Document Intelligence configured: "
        f"{'yes' if report['azure_document_intelligence_configured'] else 'no'}",
    ]

    sample_pdfs = report["sample_pdfs"]
    if sample_pdfs:
        lines.append("Sample PDFs: " + ", ".join(sample_pdfs))

    warnings = report["warnings"]
    if warnings:
        lines.append("Warnings:")
        lines.extend(f"- {warning}" for warning in warnings)

    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    settings = Settings()

    if args.command != "preflight":
        parser.error(f"Unsupported command: {args.command}")

    input_dir = resolve_path(settings.project_root, args.input_dir)
    output_dir = resolve_path(settings.project_root, args.output_dir)
    report = build_preflight_report(
        settings=settings, input_dir=input_dir, output_dir=output_dir)

    if args.format == "json":
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print(format_preflight_report(report))

    return 0 if report["ready"] else 1


def run() -> None:
    raise SystemExit(main())
