from __future__ import annotations

import json
from pathlib import Path

from portfolio_metrics.pipeline import normalize_parser_output
from portfolio_metrics.schema import NormalizationResult, ParserOutput

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_DIR = PROJECT_ROOT / "tests" / "fixtures" / "parsed"


def _load_parser_output(file_name: str) -> ParserOutput:
    payload = json.loads((FIXTURE_DIR / file_name).read_text(encoding="utf-8"))
    return ParserOutput.model_validate(payload)


def _metrics_by_company(result: NormalizationResult, company_name: str) -> dict[str, object]:
    return {
        metric.canonical_metric: metric
        for metric in result.metrics
        if metric.company_name == company_name
    }


def test_normalize_parser_output_extracts_core_metrics_from_novacloud_fixture() -> None:
    result = normalize_parser_output(
        _load_parser_output("NovaCloud_Q2_2025.parsed.json"))
    metrics = _metrics_by_company(result, "NovaCloud")

    assert result.document_type == "company_report"
    assert result.period == "Q2 2025"
    assert result.companies == ["NovaCloud"]
    assert metrics["revenue_qtr"].value == 8_400_000.0
    assert metrics["arr_eop"].value == 34_200_000.0
    assert metrics["gross_margin_pct"].value == 78.0
    assert metrics["net_revenue_retention_pct"].value == 123.0
    assert metrics["logo_churn_pct"].value == 5.8
    assert metrics["cash_balance"].value == 19_600_000.0
    assert metrics["monthly_burn"].value == -750_000.0
    assert metrics["headcount"].value == 142.0
    assert all(metric.raw_label !=
               "ARR per Full-Time Employee" for metric in result.metrics)
    assert any(issue.code == "duplicate_candidate" for issue in result.issues)


def test_normalize_parser_output_handles_multi_company_summary_fixture() -> None:
    result = normalize_parser_output(_load_parser_output(
        "Portfolio_Snapshot_Q2_2025.parsed.json"))

    assert result.document_type == "portfolio_summary"
    assert set(result.companies) == {
        "NovaCloud", "MediSight", "TalentVault", "CarbonTrack"}
    assert any(
        issue.code == "portfolio_summary_document" for issue in result.issues)

    mediasight = _metrics_by_company(result, "MediSight")
    talentvault = _metrics_by_company(result, "TalentVault")
    carbontrack = _metrics_by_company(result, "CarbonTrack")

    assert mediasight["revenue_qtr"].value == 6_800_000.0
    assert mediasight["gross_margin_pct"].value == 77.0
    assert mediasight["headcount"].value == 121.0
    assert mediasight["arr_eop"].value == 27_900_000.0
    assert talentvault["monthly_burn"].value == -680_000.0
    assert carbontrack["arr_eop"].value == 16_900_000.0
    assert carbontrack["revenue_qtr"].value == 4_100_000.0
    assert carbontrack["headcount"].value == 78.0
    assert carbontrack["monthly_burn"].value == -550_000.0


def test_normalize_parser_output_surfaces_missing_core_metrics_for_lendbridge() -> None:
    result = normalize_parser_output(
        _load_parser_output("LendBridge_Q2_2025.parsed.json"))
    metrics = _metrics_by_company(result, "LendBridge")
    missing = {
        (issue.company_name, issue.canonical_metric)
        for issue in result.issues
        if issue.code == "missing_metric"
    }

    assert set(metrics) == {"revenue_qtr", "gross_margin_pct", "headcount"}
    assert ("LendBridge", "arr_eop") in missing
    assert ("LendBridge", "cash_balance") in missing
    assert ("LendBridge", "monthly_burn") in missing
