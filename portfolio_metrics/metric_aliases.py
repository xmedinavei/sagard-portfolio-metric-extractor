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

# --- Recall-fix (Phase 1) gate-scoped extended aliases -----------------------------
# Word-order / synonym label drift verified in the 24-doc corpus (e.g. "End-of-Period
# ARR" ≠ the frozen "ARR (End of Period)" key). These are merged into the lookup ONLY
# in enhanced mode; the legacy _ALIAS_BY_LABEL table below is left untouched, so
# non-opted-in output stays byte-identical. Exact rows only — token-sort and fuzzy
# matching were rejected (see case-study/ii-a-backend-fix-plan.md §5) as over-capture
# risks. "Total Billings" / "Net Revenue" are deliberately NOT blanket-aliased here;
# they are recovered only via declared footnote equivalence (find_label_equivalences).
EXTENDED_ALIASES: tuple[MetricAlias, ...] = (
    MetricAlias("arr_eop", "End-of-Period ARR", "usd", 0.98, basis="period_end"),
    MetricAlias("arr_eop", "Contracted ARR (end of period)",
                "usd", 0.97, basis="period_end"),
    MetricAlias("arr_eop", "Subscription ARR (end of period)",
                "usd", 0.97, basis="period_end"),
    MetricAlias("logo_churn_pct", "Logo Churn Rate(LTM)",
                "percentage", 0.98, basis="ltm"),
    MetricAlias("logo_churn_pct", "Annual Logo Churn", "percentage", 0.96),
    MetricAlias("net_revenue_retention_pct", "NRR(LTM)",
                "percentage", 0.97, basis="ltm"),
    MetricAlias("net_revenue_retention_pct",
                "Net Pound Retention-NPR(LTM)", "percentage", 0.96, basis="ltm"),
    MetricAlias("revenue_qtr", "Quarterly Revenue (recognized)",
                "usd", 0.95, basis="quarterly"),
)

_ALIAS_BY_LABEL = {normalize_label_text(
    alias.label): alias for alias in ALIASES}
# Enhanced-only superset: legacy exact-match table plus the drifted labels. Built once
# at import; the legacy table is never mutated (last-wins is safe — keys are collision-
# free, asserted by tests/test_recall_alias.py).
_EXTENDED_ALIAS_BY_LABEL = {
    **_ALIAS_BY_LABEL,
    **{normalize_label_text(alias.label): alias for alias in EXTENDED_ALIASES},
}
NARRATIVE_ALIASES: tuple[MetricAlias, ...] = tuple(
    sorted((alias for alias in ALIASES if alias.narrative_safe),
           key=lambda alias: len(alias.label), reverse=True)
)

# Footnote-equivalence stitching (Phase 1): read whole-document "(n) X is equivalent to
# Y" notes so a drifted label declared equivalent to a known one is recovered. Matches
# "<left> [is] equivalent to <right>" for both quoted and unquoted labels (the corpus
# uses "'X' is equivalent to 'Y'" far more often than the bare form), and stops at the
# explanatory tail / punctuation. Quotes are optional delimiters, not part of the label.
_EQUIVALENCE_RE = re.compile(
    r"['\"’‘]?(?P<left>[A-Za-z][\w %()/&.+-]{1,58}?)['\"’‘]?\s+(?:is\s+)?equivalent\s+to\s+"
    r"['\"’‘]?(?P<right>[A-Za-z][\w %()/&.+-]{1,58}?)['\"’‘]?"
    r"(?=\s+(?:used|reported|in|metric|for|prior|computed|and|versus)\b|['\"’‘.,;)]|$)",
    re.IGNORECASE,
)
# Trailing currency/unit token, stripped only for the enhanced footnote-stitch lookup so
# a table label like "Net Revenue(USD)" matches a footnote that says "Net Revenue".
_UNIT_SUFFIX_RE = re.compile(r"\s+(usd|gbp|eur|percentage|percent|count|bps)$")


def strip_unit_suffix(normalized_label: str) -> str:
    """Drop a trailing currency/unit token from an already-normalized label."""

    return _UNIT_SUFFIX_RE.sub("", normalized_label).strip()


def find_label_equivalences(text: str) -> list[tuple[str, str]]:
    """Extract ('left label', 'right label') pairs from equivalence footnotes in `text`."""

    pairs: list[tuple[str, str]] = []
    for raw_line in text.splitlines():
        line = raw_line.strip().strip("_").strip()
        match = _EQUIVALENCE_RE.search(line)
        if match is None:
            continue
        left = match.group("left").strip().strip("'\"’").strip()
        right = match.group("right").strip().strip("'\"’").strip()
        if left and right:
            pairs.append((left, right))
    return pairs


def find_alias_for_label(raw_label: str | None, *, enhanced: bool = False) -> MetricAlias | None:
    """Resolve a label to a canonical alias when the semantics are clearly equivalent.

    In enhanced mode the lookup consults the extended (drifted-label) table; legacy uses
    only the frozen exact-match table, so default behavior is unchanged.
    """

    if not raw_label:
        return None
    table = _EXTENDED_ALIAS_BY_LABEL if enhanced else _ALIAS_BY_LABEL
    return table.get(normalize_label_text(raw_label))


def resolve_candidate_alias(
    raw_label: str, matched_alias: str | None = None, *, enhanced: bool = False
) -> MetricAlias | None:
    """Resolve the most reliable alias available for a detected candidate."""

    return (
        find_alias_for_label(raw_label, enhanced=enhanced)
        or find_alias_for_label(matched_alias, enhanced=enhanced)
    )


def infer_metric_basis(raw_label: str, alias: MetricAlias) -> str | None:
    """Infer reporting basis without over-normalizing ambiguous labels."""

    normalized = normalize_label_text(raw_label or alias.label)
    if "ltm" in normalized:
        return "ltm"
    return alias.basis
