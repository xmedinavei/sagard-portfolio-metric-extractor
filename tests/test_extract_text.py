from __future__ import annotations

import json
from pathlib import Path

from portfolio_metrics.cli import main
from portfolio_metrics.config import Settings
from portfolio_metrics.extract_text import REPRESENTATIVE_PDFS, parse_pdf, resolve_pdf_inputs
from portfolio_metrics.schema import ParserOutput

PROJECT_ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = PROJECT_ROOT / "intake-pdf"
FIXTURE_DIR = PROJECT_ROOT / "tests" / "fixtures" / "parsed"
SAMPLE_PDF = INPUT_DIR / "NovaCloud_Q2_2025.pdf"


def test_resolve_pdf_inputs_prefers_representative_set() -> None:
    resolved = resolve_pdf_inputs(PROJECT_ROOT, INPUT_DIR, [])

    assert [path.name for path in resolved] == list(REPRESENTATIVE_PDFS)


def test_parse_pdf_falls_back_to_local_when_firecrawl_is_unconfigured() -> None:
    settings = Settings(
        _env_file=None, pdf_parser="firecrawl", firecrawl_api_key=None)

    output = parse_pdf(settings=settings, pdf_path=SAMPLE_PDF)

    assert output.requested_parser == "firecrawl"
    assert output.parser_used == "local"
    assert output.page_count == 1
    assert "Recognized Revenue" in output.combined_text()
    assert any("falling back" in note.lower() for note in output.notes)


def test_extract_command_writes_phase2_artifacts(tmp_path: Path, capsys) -> None:
    exit_code = main(
        [
            "extract",
            str(SAMPLE_PDF),
            "--output-dir",
            str(tmp_path),
            "--parser",
            "local",
        ]
    )
    captured = capsys.readouterr()

    json_output = tmp_path / "NovaCloud_Q2_2025.parsed.json"
    markdown_output = tmp_path / "NovaCloud_Q2_2025.parsed.md"

    assert exit_code == 0
    assert "Phase 2 extraction: ready" in captured.out
    assert json_output.exists()
    assert markdown_output.exists()

    payload = json.loads(json_output.read_text(encoding="utf-8"))
    parsed = ParserOutput.model_validate(payload)
    assert parsed.file_name == "NovaCloud_Q2_2025.pdf"
    assert parsed.parser_used == "local"
    assert parsed.provenance.page_level is True


def test_checked_in_phase2_fixtures_are_well_formed() -> None:
    for pdf_name in REPRESENTATIVE_PDFS:
        fixture_path = FIXTURE_DIR / f"{Path(pdf_name).stem}.parsed.json"
        assert fixture_path.exists(
        ), f"Missing checked-in fixture: {fixture_path}"

        payload = json.loads(fixture_path.read_text(encoding="utf-8"))
        parsed = ParserOutput.model_validate(payload)
        assert parsed.file_name == pdf_name
        assert parsed.pages
        assert parsed.combined_text()
