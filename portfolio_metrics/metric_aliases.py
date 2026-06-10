from __future__ import annotations

import re
from dataclasses import dataclass

from .schema import CanonicalMetric, MeasurementUnit

CORE_METRICS: tuple[CanonicalMetric, ...] = (
    "revenue_qtr",
    "arr_eop",
    "gross_margin_pct",
    "cash_balance",
    "monthly_burn",
    "headcount",
)
OPTIONAL_METRICS: tuple[CanonicalMetric, ...] = (
    "net_revenue_retention_pct",
    "logo_churn_pct",
)
ALL_SUPPORTED_METRICS: tuple[CanonicalMetric, ...] = (
    *CORE_METRICS, *OPTIONAL_METRICS)


@dataclass(frozen=True, slots=True)
class MetricAlias:
    """Alias definition used during candidate detection and conservative mapping."""

    canonical_metric: CanonicalMetric
    label: str
    unit: MeasurementUnit
    confidence: float
    basis: str | None = None
    narrative_safe: bool = False


def normalize_label_text(label: str) -> str:
    """Collapse cosmetic label differences while preserving semantics."""

    lowered = label.strip().lower().replace("&", " and ").replace("/", " ")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", lowered)).strip()


ALIASES: tuple[MetricAlias, ...] = (
    MetricAlias("revenue_qtr", "Recognized Revenue (USD)", "usd",
                0.99, basis="quarterly", narrative_safe=True),
    MetricAlias("revenue_qtr", "Recognized Revenue", "usd",
                0.98, basis="quarterly", narrative_safe=True),
    MetricAlias("revenue_qtr", "Total Recognized Revenue", "usd",
                0.97, basis="quarterly", narrative_safe=True),
    MetricAlias("revenue_qtr", "Quarterly Recognized Revenue",
                "usd", 0.97, basis="quarterly", narrative_safe=True),
    MetricAlias("revenue_qtr", "Quarterly Revenue", "usd",
                0.95, basis="quarterly", narrative_safe=True),
    MetricAlias("revenue_qtr", "Platform Revenue (recognized)",
                "usd", 0.94, basis="quarterly", narrative_safe=True),
    MetricAlias("revenue_qtr", "Revenue", "usd", 0.82, basis="quarterly"),
    MetricAlias("arr_eop", "ARR (End of Period)", "usd", 0.99,
                basis="period_end", narrative_safe=True),
    MetricAlias("arr_eop", "Annual Recurring Revenue", "usd",
                0.98, basis="period_end", narrative_safe=True),
    MetricAlias("arr_eop", "Contracted ARR", "usd", 0.96,
                basis="period_end", narrative_safe=True),
    MetricAlias("arr_eop", "ARR", "usd", 0.86, basis="period_end"),
    MetricAlias("gross_margin_pct", "Gross Margin", "percentage",
                0.98, basis="quarterly", narrative_safe=True),
    MetricAlias("gross_margin_pct", "Gross Margin %",
                "percentage", 0.97, basis="quarterly"),
    MetricAlias("cash_balance", "Cash Balance", "usd", 0.99,
                basis="period_end", narrative_safe=True),
    MetricAlias("cash_balance", "Cash & Equivalents", "usd",
                0.97, basis="period_end", narrative_safe=True),
    MetricAlias("cash_balance", "Cash & Restricted Cash", "usd",
                0.92, basis="period_end", narrative_safe=True),
    MetricAlias("cash_balance", "Cash", "usd", 0.84, basis="period_end"),
    MetricAlias("monthly_burn", "Monthly Net Burn", "usd",
                0.99, basis="monthly", narrative_safe=True),
    MetricAlias("monthly_burn", "Monthly Cash Burn", "usd",
                0.98, basis="monthly", narrative_safe=True),
    MetricAlias("monthly_burn", "Net Burn (monthly)", "usd",
                0.97, basis="monthly", narrative_safe=True),
    MetricAlias("monthly_burn", "Cash Burn (monthly)", "usd",
                0.96, basis="monthly", narrative_safe=True),
    MetricAlias("headcount", "Total Headcount", "count", 0.99,
                basis="period_end", narrative_safe=True),
    MetricAlias("headcount", "Headcount", "count", 0.95,
                basis="period_end", narrative_safe=True),
    MetricAlias("headcount", "FTE", "count", 0.90, basis="period_end"),
    MetricAlias("headcount", "Full-Time Employees", "count",
                0.93, basis="period_end", narrative_safe=True),
    MetricAlias(
        "net_revenue_retention_pct",
        "Net Dollar Retention",
        "percentage",
        0.98,
        narrative_safe=True,
    ),
    MetricAlias(
        "net_revenue_retention_pct",
        "Net Dollar Retention (LTM)",
        "percentage",
        0.99,
        basis="ltm",
        narrative_safe=True,
    ),
    MetricAlias(
        "net_revenue_retention_pct",
        "Net Revenue Retention",
        "percentage",
        0.96,
        narrative_safe=True,
    ),
    MetricAlias(
        "net_revenue_retention_pct",
        "Net Revenue Retention (LTM)",
        "percentage",
        0.99,
        basis="ltm",
        narrative_safe=True,
    ),
    MetricAlias("net_revenue_retention_pct", "NRR", "percentage", 0.88),
    MetricAlias("logo_churn_pct", "Logo Churn",
                "percentage", 0.95, narrative_safe=True),
    MetricAlias("logo_churn_pct", "Logo Churn (LTM)", "percentage",
                0.99, basis="ltm", narrative_safe=True),
)

_ALIAS_BY_LABEL = {normalize_label_text(
    alias.label): alias for alias in ALIASES}
NARRATIVE_ALIASES: tuple[MetricAlias, ...] = tuple(
    sorted((alias for alias in ALIASES if alias.narrative_safe),
           key=lambda alias: len(alias.label), reverse=True)
)


def find_alias_for_label(raw_label: str | None) -> MetricAlias | None:
    """Resolve a label to a canonical alias when the semantics are clearly equivalent."""

    if not raw_label:
        return None
    return _ALIAS_BY_LABEL.get(normalize_label_text(raw_label))


def resolve_candidate_alias(raw_label: str, matched_alias: str | None = None) -> MetricAlias | None:
    """Resolve the most reliable alias available for a detected candidate."""

    return find_alias_for_label(raw_label) or find_alias_for_label(matched_alias)


def infer_metric_basis(raw_label: str, alias: MetricAlias) -> str | None:
    """Infer reporting basis without over-normalizing ambiguous labels."""

    normalized = normalize_label_text(raw_label or alias.label)
    if "ltm" in normalized:
        return "ltm"
    return alias.basis
