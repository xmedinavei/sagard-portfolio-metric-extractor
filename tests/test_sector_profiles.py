"""Phase 2 — Class C sector-aware missing-metric check (behind the recall-mode gate).

Proves the document sector is read from whole-document vocabulary, that each sector's
expected-metric profile drops only structurally-inapplicable metrics, and that the
enhanced missing-metric check therefore silences sector-blind false alarms while still
surfacing a metric the sector DOES expect but did not print. Legacy stays sector-blind
(byte-identical), guarded here and by the golden summary.
"""
from __future__ import annotations

import json
from pathlib import Path

from portfolio_metrics.detect_metrics import classify_sector
from portfolio_metrics.metric_aliases import CORE_METRICS
from portfolio_metrics.pipeline import normalize_parser_output
from portfolio_metrics.schema import ParserOutput
from portfolio_metrics.sector_profiles import expected_metrics_for

GOLDEN_DIR = Path(__file__).resolve().parents[0] / "golden" / "parsed"


def _load(name: str) -> ParserOutput:
    return ParserOutput.model_validate(
        json.loads((GOLDEN_DIR / name).read_text(encoding="utf-8")))


def _missing(result) -> set[tuple[str | None, str | None]]:
    return {(i.company_name, i.canonical_metric)
            for i in result.issues if i.code == "missing_metric"}


# --- 2.1: classify_sector routes each document by distinctive vocabulary ---

def test_classify_sector_routes_each_family() -> None:
    assert classify_sector(_load("LendBridge_Q2_2025.parsed.json")) == "credit"
    assert classify_sector(_load("ApexFreight_Q2_2025.parsed.json")) == "marketplace"
    assert classify_sector(_load("FleetLink_Q4_2024.parsed.json")) == "marketplace"
    assert classify_sector(_load("ClearPay_Q2_2025.parsed.json")) == "payments"
    assert classify_sector(_load("NovaCloud_Q2_2025.parsed.json")) == "saas"
    # A SaaS-only portfolio summary carries no distinctive anchor -> default SaaS.
    assert classify_sector(_load("Portfolio_Snapshot_Q2_2025.parsed.json")) == "saas"


# --- 2.2: sector profiles keep SaaS at parity and drop only inapplicable metrics ---

def test_saas_profile_is_exactly_core_metrics() -> None:
    assert expected_metrics_for("saas") == CORE_METRICS


def test_unknown_or_missing_sector_falls_back_to_core_metrics() -> None:
    assert expected_metrics_for(None) == CORE_METRICS


def test_credit_profile_drops_saas_only_metrics() -> None:
    credit = set(expected_metrics_for("credit"))
    assert {"arr_eop", "cash_balance", "monthly_burn"}.isdisjoint(credit)
    assert {"revenue_qtr", "gross_margin_pct", "headcount"} <= credit


def test_marketplace_and_payments_drop_only_arr() -> None:
    for sector in ("marketplace", "payments"):
        profile = set(expected_metrics_for(sector))
        assert "arr_eop" not in profile
        assert {"revenue_qtr", "gross_margin_pct",
                "cash_balance", "monthly_burn", "headcount"} <= profile


# --- 2.4: enhanced silences sector-blind alarms; legacy keeps them ---

def test_enhanced_missing_check_silences_lender_false_alarms() -> None:
    legacy = normalize_parser_output(_load("LendBridge_Q2_2025.parsed.json"))
    enhanced = normalize_parser_output(
        _load("LendBridge_Q2_2025.parsed.json"), recall_mode="enhanced")

    # Legacy flags a lender for absent SaaS metrics (the false alarms).
    assert ("LendBridge", "arr_eop") in _missing(legacy)
    assert ("LendBridge", "cash_balance") in _missing(legacy)
    assert ("LendBridge", "monthly_burn") in _missing(legacy)

    # Enhanced does not — a lender is not judged against ARR / cash-runway / burn.
    enhanced_missing = _missing(enhanced)
    assert ("LendBridge", "arr_eop") not in enhanced_missing
    assert ("LendBridge", "cash_balance") not in enhanced_missing
    assert ("LendBridge", "monthly_burn") not in enhanced_missing


def test_enhanced_still_flags_a_metric_the_sector_expects_but_omits() -> None:
    # LendBridge Q2 2024 did not print headcount — a metric the credit profile DOES expect.
    # Sector-awareness must silence false alarms without hiding this real gap.
    enhanced = normalize_parser_output(
        _load("LendBridge_Q2_2024.parsed.json"), recall_mode="enhanced")
    missing = _missing(enhanced)
    assert ("LendBridge", "headcount") in missing
    assert ("LendBridge", "arr_eop") not in missing


def test_enhanced_missing_check_silences_marketplace_and_payments_arr() -> None:
    # The other side of demo insight #2: marketplace / payments companies measure GMV / TPV,
    # not ARR — so the ARR false alarm is silenced end-to-end (not only credit).
    apex = normalize_parser_output(
        _load("ApexFreight_Q2_2025.parsed.json"), recall_mode="enhanced")
    clearpay = normalize_parser_output(
        _load("ClearPay_Q2_2025.parsed.json"), recall_mode="enhanced")

    assert ("ApexFreight", "arr_eop") in _missing(
        normalize_parser_output(_load("ApexFreight_Q2_2025.parsed.json")))  # legacy flags it
    assert ("ApexFreight", "arr_eop") not in _missing(apex)
    assert ("ClearPay", "arr_eop") not in _missing(clearpay)


# --- §A contract: metric.sector is populated in enhanced, None in legacy ---

def test_metric_sector_is_populated_in_enhanced_and_none_in_legacy() -> None:
    legacy = normalize_parser_output(_load("LendBridge_Q2_2025.parsed.json"))
    enhanced = normalize_parser_output(
        _load("LendBridge_Q2_2025.parsed.json"), recall_mode="enhanced")

    assert all(m.sector is None for m in legacy.metrics)
    assert enhanced.metrics and all(
        m.sector == "credit" for m in enhanced.metrics)
