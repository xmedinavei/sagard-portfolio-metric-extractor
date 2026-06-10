from __future__ import annotations

from pathlib import Path

import pytest

from portfolio_metrics.pipeline import normalize_parser_output
from portfolio_metrics.schema import (
    ExtractedPage,
    NormalizationResult,
    ParserOutput,
    ProvenanceStrategy,
)

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def _build_firecrawl_parser_output(file_name: str, text: str) -> ParserOutput:
    return ParserOutput(
        file_name=file_name,
        source_path=str(PROJECT_ROOT / "intake-pdf" / file_name),
        requested_parser="firecrawl",
        parser_used="firecrawl",
        raw_format="markdown",
        page_count=1,
        pages=[ExtractedPage.from_text(text)],
        provenance=ProvenanceStrategy(
            file_level=True,
            page_level=False,
            snippet_level=False,
            description="Test-only synthetic Firecrawl markdown.",
        ),
        notes=["Firecrawl PDF mode: auto."],
    )


def _metrics_by_company(result: NormalizationResult, company_name: str) -> dict[str, object]:
    return {
        metric.canonical_metric: metric
        for metric in result.metrics
        if metric.company_name == company_name
    }


@pytest.mark.parametrize(
    ("file_name", "text", "company_name", "expected_values"),
    [
        (
            "ClearPay_Q2_2025.pdf",
            """
ClearPay Technologies Ltd.

Period: Q2 2025

| Metric | Q2 2025 | Q1 2025 |
| --- | --- | --- |
| Total Recognized Revenue | $17.3M | $16.1M |
| Gross Margin | 67% | 66% |
| Total Headcount | 211 | 203 |
| Cash&Restricted Cash | $38.4M | $40.1M |
            """,
            "ClearPay",
            {
                "revenue_qtr": 17_300_000.0,
                "gross_margin_pct": 67.0,
                "headcount": 211.0,
                "cash_balance": 38_400_000.0,
            },
        ),
        (
            "CarbonTrack_Q2_2025.pdf",
            """
CarbonTrack Analytics Corp.

Period: Q2 2025

| Metric | Q2 2025 | Q1 2025 |
| --- | --- | --- |
| Contracted ARR | $16.9M | $15.2M |
| Recognized Revenue | $4.1M | $3.8M |
| Gross Margin | 73% | 72% |
| Net Revenue Retention(LTM) | 121% | 118% |
| Logo Churn(LTM) | 3.8% | 4.1% |
| Total Headcount | 78 | 72 |
| Monthly Net Burn | ($0.55M) | ($0.61M) |
| Cash Balance | $13.8M | $14.8M |
            """,
            "CarbonTrack",
            {
                "arr_eop": 16_900_000.0,
                "revenue_qtr": 4_100_000.0,
                "gross_margin_pct": 73.0,
                "net_revenue_retention_pct": 121.0,
                "logo_churn_pct": 3.8,
                "headcount": 78.0,
                "monthly_burn": -550_000.0,
                "cash_balance": 13_800_000.0,
            },
        ),
        (
            "ConstructIQ_Q2_2025.pdf",
            """
ConstructIQ Solutions Inc.

Period: Q2 2025

| Metric | Q2 2025 | Q1 2025 |
| --- | --- | --- |
| Annual Recurring Revenue | $18.6M | $17.1M |
| Quarterly Recognized Revenue | $4.5M | $4.2M |
| Gross Margin | 71% | 70% |
| Net Revenue Retention (LTM) | 112% | 110% |
| Logo Churn(LTM) | 6.3% | 6.8% |
| Total Headcount | 89 | 84 |
| Cash&Equivalents | $11.2M | $12.1M |
            """,
            "ConstructIQ",
            {
                "arr_eop": 18_600_000.0,
                "revenue_qtr": 4_500_000.0,
                "gross_margin_pct": 71.0,
                "net_revenue_retention_pct": 112.0,
                "logo_churn_pct": 6.3,
                "headcount": 89.0,
                "cash_balance": 11_200_000.0,
            },
        ),
    ],
)
def test_normalize_parser_output_uses_document_period_column_for_firecrawl_comparative_tables(
    file_name: str,
    text: str,
    company_name: str,
    expected_values: dict[str, float],
) -> None:
    parser_output = _build_firecrawl_parser_output(file_name, text)

    result = normalize_parser_output(parser_output)
    metrics = _metrics_by_company(result, company_name)

    assert result.period == "Q2 2025"
    assert result.companies == [company_name]
    for canonical_metric, expected_value in expected_values.items():
        assert metrics[canonical_metric].value == expected_value
