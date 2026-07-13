from __future__ import annotations

from .metric_aliases import CORE_METRICS
from .schema import CanonicalMetric, SectorKind

# Recall-fix (Phase 2): per-sector expected core-metric sets for the sector-aware
# missing-metric check. Enhanced mode swaps CORE_METRICS for the sector's set so a
# lender / marketplace / payments company is not judged against SaaS-only metrics
# (the source of the 15 sector-blind false "missing" alarms in the audit).
#
# Membership rule: keep only metrics the business model structurally reports. A metric a
# model does not report is not a "missing" alarm — but a metric it DOES report and did not
# print is still a real gap (Phase 1 recall territory), so it stays in the expected set.
#   - credit  : a lender reports interest revenue, a lending margin, and headcount; its
#               capital adequacy is covenant headroom / balance-sheet leverage, not ARR,
#               cash-runway, or VC-style monthly burn. (LendBridge reports no cash line.)
#   - market. : measures GMV / take-rate instead of ARR; still an operating company with
#               revenue, margin, cash, burn, headcount.
#   - payments: measures TPV / take-rate instead of ARR; otherwise as marketplace.
#   - saas    : the full CORE_METRICS set, unchanged (legacy parity).
_SECTOR_EXPECTED_METRICS: dict[SectorKind, tuple[CanonicalMetric, ...]] = {
    "saas": CORE_METRICS,
    "credit": ("revenue_qtr", "gross_margin_pct", "headcount"),
    "marketplace": (
        "revenue_qtr", "gross_margin_pct", "cash_balance", "monthly_burn", "headcount",
    ),
    "payments": (
        "revenue_qtr", "gross_margin_pct", "cash_balance", "monthly_burn", "headcount",
    ),
}


def expected_metrics_for(sector: SectorKind | None) -> tuple[CanonicalMetric, ...]:
    """Return the core metrics a company in this sector is expected to report.

    An unknown or ``None`` sector falls back to the full ``CORE_METRICS`` set, so the
    default (legacy) behavior is preserved for anything not explicitly profiled.
    """

    if sector is None:
        return CORE_METRICS
    return _SECTOR_EXPECTED_METRICS.get(sector, CORE_METRICS)
