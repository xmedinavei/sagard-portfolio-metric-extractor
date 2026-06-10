from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from .config import Settings
from .parser import PdfParserError
from .parser_firecrawl import FirecrawlPdfParser
from .parser_local import LocalPdfParser
from .schema import ParserOutput

REPRESENTATIVE_PDFS = (
    "NovaCloud_Q2_2025.pdf",
    "LendBridge_Q2_2025.pdf",
    "Portfolio_Snapshot_Q2_2025.pdf",
)


@dataclass
class WrittenExtraction:
    output: ParserOutput
    json_path: Path
    markdown_path: Path


@dataclass
class ExtractionFailure:
    input_path: Path
    error: str


def resolve_pdf_inputs(project_root: Path, input_dir: Path, raw_inputs: Iterable[str]) -> list[Path]:
    requested = list(raw_inputs)
    if requested:
        resolved: list[Path] = []
        for raw_input in requested:
            candidate = Path(raw_input)
            if not candidate.is_absolute():
                project_candidate = (project_root / candidate).resolve()
                input_candidate = (input_dir / candidate).resolve()
                candidate = input_candidate if not project_candidate.exists(
                ) and input_candidate.exists() else project_candidate
            else:
                candidate = candidate.resolve()

            if candidate.is_dir():
                resolved.extend(sorted(path.resolve()
                                for path in candidate.glob("*.pdf")))
            else:
                resolved.append(candidate)
        return _dedupe_paths(resolved)

    available = sorted(path.resolve() for path in input_dir.glob(
        "*.pdf")) if input_dir.is_dir() else []
    representative = [
        next(path for path in available if path.name == name)
        for name in REPRESENTATIVE_PDFS
        if any(path.name == name for path in available)
    ]
    return representative or available


def extract_documents(
    settings: Settings,
    pdf_paths: Iterable[Path],
    output_dir: Path,
    *,
    parser_name: str | None = None,
    allow_fallback: bool = True,
) -> tuple[list[WrittenExtraction], list[ExtractionFailure]]:
    output_dir.mkdir(parents=True, exist_ok=True)

    written: list[WrittenExtraction] = []
    failures: list[ExtractionFailure] = []
    for pdf_path in pdf_paths:
        if not pdf_path.is_file():
            failures.append(ExtractionFailure(
                input_path=pdf_path, error="Input PDF is missing."))
            continue

        try:
            parsed = parse_pdf(
                settings=settings,
                pdf_path=pdf_path,
                parser_name=parser_name,
                allow_fallback=allow_fallback,
            )
            written.append(write_extraction_artifacts(parsed, output_dir))
        except PdfParserError as exc:
            failures.append(ExtractionFailure(
                input_path=pdf_path, error=str(exc)))

    return written, failures


def parse_pdf(
    settings: Settings,
    pdf_path: Path,
    *,
    parser_name: str | None = None,
    allow_fallback: bool = True,
) -> ParserOutput:
    requested_parser = parser_name or settings.pdf_parser
    if requested_parser == "local":
        return LocalPdfParser().parse(pdf_path)

    notes: list[str] = []
    if not settings.firecrawl_configured:
        if not allow_fallback:
            raise PdfParserError(
                "FIRECRAWL_API_KEY is not configured and local fallback is disabled."
            )
        notes.append(
            "FIRECRAWL_API_KEY is not configured; falling back to the local parser.")
        return _apply_fallback_notes(LocalPdfParser().parse(pdf_path), requested_parser, notes)

    firecrawl_parser = FirecrawlPdfParser(
        settings.firecrawl_api_key or "",
        mode=settings.firecrawl_pdf_mode,
        timeout_seconds=settings.firecrawl_timeout_seconds,
    )
    try:
        return firecrawl_parser.parse(pdf_path)
    except PdfParserError as exc:
        if not allow_fallback:
            raise
        notes.append(
            f"Firecrawl parse failed ({exc}); falling back to the local parser.")
        return _apply_fallback_notes(LocalPdfParser().parse(pdf_path), requested_parser, notes)


def write_extraction_artifacts(parsed: ParserOutput, output_dir: Path) -> WrittenExtraction:
    output_dir.mkdir(parents=True, exist_ok=True)
    stem = Path(parsed.file_name).stem
    json_path = output_dir / f"{stem}.parsed.json"
    markdown_path = output_dir / f"{stem}.parsed.md"

    json_path.write_text(parsed.model_dump_json(indent=2), encoding="utf-8")
    markdown_path.write_text(parsed.to_markdown(), encoding="utf-8")
    return WrittenExtraction(output=parsed, json_path=json_path, markdown_path=markdown_path)


def build_extract_report(
    *,
    requested_parser: str,
    output_dir: Path,
    written: Iterable[WrittenExtraction],
    failures: Iterable[ExtractionFailure],
) -> dict[str, object]:
    written_list = list(written)
    failure_list = list(failures)
    report_files = [
        {
            "file_name": item.output.file_name,
            "parser_used": item.output.parser_used,
            "page_count": item.output.page_count,
            "raw_format": item.output.raw_format,
            "json_output": str(item.json_path),
            "markdown_output": str(item.markdown_path),
            "notes": item.output.notes,
        }
        for item in written_list
    ]
    report_failures = [
        {"input_path": str(item.input_path), "error": item.error}
        for item in failure_list
    ]
    return {
        "requested_parser": requested_parser,
        "output_dir": str(output_dir),
        "processed_count": len(report_files),
        "failure_count": len(report_failures),
        "files": report_files,
        "failures": report_failures,
        "ready": bool(report_files) and not report_failures,
    }


def format_extract_report(report: dict[str, object]) -> str:
    status = "ready" if report["ready"] else "needs attention"
    lines = [
        f"Phase 2 extraction: {status}",
        f"Requested parser: {report['requested_parser']}",
        f"Artifact directory: {report['output_dir']}",
        f"PDFs processed: {report['processed_count']}",
        f"Failures: {report['failure_count']}",
    ]

    files = report["files"]
    if isinstance(files, list) and files:
        lines.append("Artifacts:")
        for item in files:
            notes = item.get("notes") or []
            notes_suffix = ""
            if isinstance(notes, list) and notes:
                notes_suffix = f" | notes: {'; '.join(str(note) for note in notes)}"
            lines.append(
                "- "
                f"{item['file_name']} -> parser={item['parser_used']}, pages={item['page_count']}, "
                f"json={item['json_output']}, markdown={item['markdown_output']}"
                f"{notes_suffix}"
            )

    failures = report["failures"]
    if isinstance(failures, list) and failures:
        lines.append("Failures:")
        for item in failures:
            lines.append(f"- {item['input_path']}: {item['error']}")

    return "\n".join(lines)


def _apply_fallback_notes(parsed: ParserOutput, requested_parser: str, notes: list[str]) -> ParserOutput:
    return parsed.model_copy(
        update={
            "requested_parser": requested_parser,
            "notes": [*notes, *parsed.notes],
        }
    )


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
