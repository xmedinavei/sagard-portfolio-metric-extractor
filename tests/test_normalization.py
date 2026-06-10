from __future__ import annotations

from portfolio_metrics.normalize import normalize_candidates
from portfolio_metrics.schema import MetricCandidate


def test_normalize_candidates_prefers_table_candidate_over_duplicate_narrative_match() -> None:
    candidates = [
        MetricCandidate(
            source_file="NovaCloud_Q2_2025.pdf",
            source_page=1,
            company_name="NovaCloud",
            period="Q2 2025",
            canonical_metric="revenue_qtr",
            raw_label="Recognized Revenue",
            raw_value_text="$8.4M",
            matched_alias="Recognized Revenue",
            source_snippet="Recognized Revenue in Q2 2025 was $8.4M.",
            detection_method="narrative",
            label_confidence=0.88,
        ),
        MetricCandidate(
            source_file="NovaCloud_Q2_2025.pdf",
            source_page=1,
            company_name="NovaCloud",
            period="Q2 2025",
            canonical_metric="revenue_qtr",
            raw_label="Recognized Revenue (USD)",
            raw_value_text="$8.4M",
            matched_alias="Recognized Revenue (USD)",
            source_snippet="Recognized Revenue (USD) $8.4M",
            detection_method="table_row",
            label_confidence=0.99,
        ),
    ]

    metrics, issues = normalize_candidates(
        candidates, document_type="company_report")

    assert len(metrics) == 1
    metric = metrics[0]
    assert metric.canonical_metric == "revenue_qtr"
    assert metric.value == 8_400_000.0
    assert metric.detection_method == "table_row"
    assert any(issue.code == "duplicate_candidate" for issue in issues)


def test_normalize_candidates_keeps_parse_failures_visible() -> None:
    candidates = [
        MetricCandidate(
            source_file="Example.pdf",
            source_page=1,
            company_name="ExampleCo",
            period="Q2 2025",
            canonical_metric="cash_balance",
            raw_label="Cash Balance",
            raw_value_text="~$5M",
            matched_alias="Cash Balance",
            source_snippet="Cash Balance ~$5M",
            detection_method="table_row",
            label_confidence=0.98,
        )
    ]

    metrics, issues = normalize_candidates(
        candidates, document_type="company_report")

    assert len(metrics) == 1
    assert metrics[0].is_valid is False
    assert metrics[0].parse_error is not None
    assert any(issue.code == "parse_failure" for issue in issues)
