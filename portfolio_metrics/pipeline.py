from __future__ import annotations

from .detect_metrics import detect_metric_candidates
from .metric_aliases import CORE_METRICS
from .normalize import normalize_candidates
from .schema import NormalizationIssue, NormalizationResult, ParserOutput


def normalize_parser_output(
    parser_output: ParserOutput,
    *,
    recall_mode: str = "legacy",
) -> NormalizationResult:
    """Run the Phase 3 detection + normalization pipeline for one parsed document."""

    detection = detect_metric_candidates(parser_output, recall_mode=recall_mode)
    metrics, issues = normalize_candidates(
        detection.candidates,
        document_type=detection.document_type,
        recall_mode=recall_mode,
    )

    companies = detection.companies or sorted(
        {metric.company_name for metric in metrics})
    issues = [*issues]
    if detection.document_type == "portfolio_summary":
        issues.insert(
            0,
            NormalizationIssue(
                severity="info",
                code="portfolio_summary_document",
                message=(
                    "This document is a portfolio summary and may duplicate company-level metrics from standalone reports."
                ),
                source_file=parser_output.file_name,
            ),
        )

    issues.extend(
        _build_missing_metric_issues(
            source_file=parser_output.file_name,
            companies=companies,
            metrics=metrics,
            recall_mode=recall_mode,
        )
    )

    return NormalizationResult(
        source_file=parser_output.file_name,
        document_type=detection.document_type,
        period=detection.period,
        companies=companies,
        metrics=metrics,
        issues=issues,
    )


def _build_missing_metric_issues(
    *,
    source_file: str,
    companies: list[str],
    metrics: list,
    recall_mode: str = "legacy",
) -> list[NormalizationIssue]:
    present_by_company = {
        company: {metric.canonical_metric for metric in metrics if metric.company_name ==
                  company and metric.is_valid}
        for company in companies
    }

    issues: list[NormalizationIssue] = []
    for company in companies:
        present_metrics = present_by_company.get(company, set())
        for canonical_metric in CORE_METRICS:
            if canonical_metric in present_metrics:
                continue
            issues.append(
                NormalizationIssue(
                    severity="warning",
                    code="missing_metric",
                    message=f"Missing core metric `{canonical_metric}` for {company} in the parsed source.",
                    source_file=source_file,
                    company_name=company,
                    canonical_metric=canonical_metric,
                )
            )
    return issues
