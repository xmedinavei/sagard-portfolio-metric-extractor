from __future__ import annotations

from .detect_metrics import classify_sector, detect_metric_candidates
from .metric_aliases import CORE_METRICS
from .normalize import normalize_candidates
from .schema import (
    NormalizationIssue,
    NormalizationResult,
    ParserOutput,
    SectorKind,
)
from .sector_profiles import expected_metrics_for


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
    # Recall-fix (Phase 2): sector is a whole-document signal; map every company in this
    # document to it so the missing-metric check can be sector-aware in enhanced mode.
    document_sector = classify_sector(parser_output)
    company_sectors = {company: document_sector for company in companies}
    # Enhanced only: stamp the §A `sector` bind target onto each row so the cockpit can
    # group/tier the grid and route non-SaaS companies out. Legacy leaves it None.
    if recall_mode == "enhanced":
        for metric in metrics:
            metric.sector = company_sectors.get(metric.company_name)
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
            company_sectors=company_sectors,
            period=detection.period,
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
    company_sectors: dict[str, SectorKind] | None = None,
    period: str | None = None,
    recall_mode: str = "legacy",
) -> list[NormalizationIssue]:
    enhanced = recall_mode == "enhanced"
    present_by_company = {
        company: {metric.canonical_metric for metric in metrics if metric.company_name ==
                  company and metric.is_valid}
        for company in companies
    }

    issues: list[NormalizationIssue] = []
    for company in companies:
        present_metrics = present_by_company.get(company, set())
        # Legacy iterates the full CORE_METRICS for every company (sector-blind, byte-
        # identical). Enhanced narrows to the company's sector profile so a lender is not
        # flagged for absent SaaS metrics — while a metric its sector DOES expect but did
        # not print still surfaces as a real gap.
        if enhanced and company_sectors is not None:
            expected_metrics = expected_metrics_for(company_sectors.get(company))
        else:
            expected_metrics = CORE_METRICS
        for canonical_metric in expected_metrics:
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
                    # §A reconciliation field; enhanced only (legacy serializer excludes it).
                    period=period if enhanced else None,
                )
            )
    return issues
