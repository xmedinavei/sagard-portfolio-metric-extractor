from __future__ import annotations

from pathlib import Path

from portfolio_metrics.cli import build_preflight_report, main
from portfolio_metrics.config import Settings


def test_build_preflight_report_counts_only_pdfs(tmp_path: Path) -> None:
    input_dir = tmp_path / "intake-pdf"
    output_dir = tmp_path / "outputs"
    input_dir.mkdir()
    output_dir.mkdir()

    (input_dir / "alpha.pdf").write_bytes(b"%PDF-1.4")
    (input_dir / "beta.pdf").write_bytes(b"%PDF-1.4")
    (input_dir / "notes.txt").write_text("not a pdf", encoding="utf-8")

    settings = Settings(_env_file=None, pdf_parser="local")
    report = build_preflight_report(
        settings=settings, input_dir=input_dir, output_dir=output_dir)

    assert report["pdf_count"] == 2
    assert report["sample_pdfs"] == ["alpha.pdf", "beta.pdf"]
    assert report["ready"] is True


def test_main_preflight_returns_zero_for_ready_layout(tmp_path: Path, capsys) -> None:
    input_dir = tmp_path / "intake-pdf"
    output_dir = tmp_path / "outputs"
    input_dir.mkdir()
    output_dir.mkdir()
    (input_dir / "portfolio_update.pdf").write_bytes(b"%PDF-1.4")

    exit_code = main(["preflight", "--input-dir",
                     str(input_dir), "--output-dir", str(output_dir)])
    captured = capsys.readouterr()

    assert exit_code == 0
    assert "Phase 1 preflight: ready" in captured.out
    assert "portfolio_update.pdf" in captured.out


def test_main_preflight_returns_nonzero_when_input_is_missing(tmp_path: Path, capsys) -> None:
    missing_input_dir = tmp_path / "missing"
    output_dir = tmp_path / "outputs"
    output_dir.mkdir()

    exit_code = main(["preflight", "--input-dir",
                     str(missing_input_dir), "--output-dir", str(output_dir)])
    captured = capsys.readouterr()

    assert exit_code == 1
    assert "needs attention" in captured.out
    assert "Input directory is missing." in captured.out
