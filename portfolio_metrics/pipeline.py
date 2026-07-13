from __future__ import annotations

import re

from .detect_metrics import classify_sector, detect_metric_candidates
from .metric_aliases import CORE_METRICS
from .normalize import normalize_candidates
from .parse_values import parse_value_text
from .schema import (
    NormalizationIssue,
    NormalizationResult,
    ParserOutput,
    SectorKind,
)
from .sector_profiles import expected_metrics_for

# Recall-fix (Phase 3): restricted / segregated client-float cash a payments company must
# EXCLUDE from liquidity (state money-transmitter rules). Read only in enhanced mode to
# compute `value_normalized`; the raw balance is always preserved. Deliberately specific —
# it fires only on a declared exclusion, never on an ordinary "restricted cash" mention.
_RESTRICTED_CASH_RE = re.compile(
    r"\$\s*(?P<held>[\d.,]+\s*[kmb]?)\s+held in segregated client float"
    r"|restricted cash of\s+\$\s*(?P<excluded>[\d.,]+\s*[kmb]?)\b[^.]*\bexcluded\b",
    re.IGNORECASE,
)


def _detect_restricted_cash_exclusion(text: str) -> float | None:
    """Return the restricted (segregated client-float) cash a payments company must exclude
    from its liquidity, or ``None`` when no such exclusion is declared in the document."""

    match = _RESTRICTED_CASH_RE.search(" ".join(text.split()))
    if match is None:
        return None
    token = match.group("held") or match.group("excluded")
    parsed = parse_value_text(f"${token}", unit_hint="usd")
    return parsed.value if parsed.error is None else None


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
        restricted_cash = _detect_restricted_cash_exclusion(
            parser_output.combined_text())
        for metric in metrics:
            metric.sector = company_sectors.get(metric.company_name)
            # Every enhanced row starts "comparable"; the cross-company basis-collision scan
            # in build_metrics_export flips genuinely non-comparable rows to "refused".
            metric.comparison_status = "comparable"
            # Phase 3 (basis): a lender's "Gross Margin" is a net-interest margin (interest
            # income minus cost of funds), structurally NOT a SaaS COGS margin — tag its
            # basis so it can never silently share a column with SaaS gross margins. (Doc 0
            # §4.5/§6A: don't auto-compare; LendBridge Q4'24 footnote (3): "Gross Margin
            # reflects net interest income net of cost of funds".)
            if metric.sector == "credit" and metric.canonical_metric == "gross_margin_pct":
                metric.metric_basis = "interest_margin"
            # Phase 3 (value_normalized): report cash net of segregated client float beside
            # the raw balance — never overwriting raw `value`. (ClearPay: $38.4M − $6.2M
            # float = $32.2M available operating cash.) Scoped to a payments company's own
            # cash for the current reporting period, so a document-level footnote can never
            # bleed onto another company's cash or a prior-period balance.
            if (
                restricted_cash is not None
                and metric.canonical_metric == "cash_balance"
                and metric.sector == "payments"
                and metric.period == detection.period
                and metric.value is not None
            ):
                metric.value_normalized = round(metric.value - restricted_cash, 6)
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
