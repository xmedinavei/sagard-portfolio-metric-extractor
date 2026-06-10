from __future__ import annotations

import json
from pathlib import Path

from portfolio_metrics.cli import main, resolve_parsed_inputs

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_DIR = PROJECT_ROOT / "tests" / "fixtures" / "parsed"


def test_resolve_parsed_inputs_reads_phase2_json_artifacts() -> None:
    resolved = resolve_parsed_inputs(PROJECT_ROOT, FIXTURE_DIR, [])

    assert {path.name for path in resolved} == {
        "NovaCloud_Q2_2025.parsed.json",
        "LendBridge_Q2_2025.parsed.json",
        "Portfolio_Snapshot_Q2_2025.parsed.json",
    }


def test_normalize_command_prints_phase3_summary(capsys) -> None:
    exit_code = main(["normalize", "--input-dir", str(FIXTURE_DIR)])
    captured = capsys.readouterr()

    assert exit_code == 0
    assert "Phase 3 normalization: ready" in captured.out
    assert "NovaCloud_Q2_2025.pdf" in captured.out
    assert "LendBridge_Q2_2025.pdf" in captured.out
    assert "Portfolio_Snapshot_Q2_2025.pdf" in captured.out
    assert "missing core metrics: arr_eop, cash_balance, monthly_burn" in captured.out


def test_normalize_command_can_emit_json(capsys) -> None:
    exit_code = main(
        [
            "normalize",
            str(FIXTURE_DIR / "NovaCloud_Q2_2025.parsed.json"),
            "--format",
            "json",
        ]
    )
    captured = capsys.readouterr()

    payload = json.loads(captured.out)

    assert exit_code == 0
    assert payload["processed_count"] == 1
    assert payload["failure_count"] == 0
    assert payload["ready"] is True

    result = payload["results"][0]
    assert result["source_file"] == "NovaCloud_Q2_2025.pdf"
    assert result["document_type"] == "company_report"
    assert any(
        metric["canonical_metric"] == "revenue_qtr" and metric["value"] == 8_400_000.0
        for metric in result["metrics"]
    )
