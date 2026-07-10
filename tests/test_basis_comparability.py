"""Phase 3 — Class D basis tags + value_normalized + refuse-to-compare (behind the gate).

Proves the tool VISIBLY refuses unsafe comparisons (demo insight #2): a lender's gross
margin is tagged as an interest margin so it never silently shares a column with SaaS
gross margins, restricted client-float cash is reported net beside the raw balance, and
the collision surfaces as a `basis_collision` issue + a "Refused comparisons" summary
section. All enhanced-only; legacy stays byte-identical (guarded here and by test_golden).

Test corpus is the committed tests/golden/parsed/ set (real drifted labels) — no new
fixtures, so the pinned tests/fixtures/parsed/ inventory stays intact.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from portfolio_metrics.pipeline import (
    _detect_restricted_cash_exclusion,
    normalize_parser_output,
)
from portfolio_metrics.publish import build_metrics_export, render_summary_markdown
from portfolio_metrics.schema import (
    NormalizationResult,
    NormalizedMetric,
    ParserOutput,
)

GOLDEN_DIR = Path(__file__).resolve().parents[0] / "golden" / "parsed"
FIXED_AT = datetime(2020, 1, 1, tzinfo=timezone.utc)


def _load(name: str) -> ParserOutput:
    return ParserOutput.model_validate(
        json.loads((GOLDEN_DIR / name).read_text(encoding="utf-8")))


def _gm_basis(result, company: str) -> set[str | None]:
    return {m.metric_basis for m in result.metrics
            if m.company_name == company and m.canonical_metric == "gross_margin_pct"}


def _build_golden_export(recall_mode: str):
    paths = sorted(GOLDEN_DIR.glob("*.parsed.json"))
    results = [normalize_parser_output(_load(p.name), recall_mode=recall_mode)
               for p in paths]
    return build_metrics_export(
        results=results, parsed_paths=paths, recall_mode=recall_mode, generated_at=FIXED_AT)


# --- 3.1: a lender's gross margin is an interest margin, tagged enhanced-only ---

def test_credit_gross_margin_is_tagged_interest_margin_in_enhanced_only() -> None:
    legacy = normalize_parser_output(_load("LendBridge_Q2_2025.parsed.json"))
    enhanced = normalize_parser_output(
        _load("LendBridge_Q2_2025.parsed.json"), recall_mode="enhanced")

    assert _gm_basis(legacy, "LendBridge") == {"quarterly"}       # unchanged default
    assert _gm_basis(enhanced, "LendBridge") == {"interest_margin"}


def test_saas_and_payments_gross_margin_stay_quarterly_in_both_modes() -> None:
    # Only a credit company's GM is re-based; a SaaS or payments GM is a normal COGS margin.
    for name, company in (("NovaCloud_Q2_2025.parsed.json", "NovaCloud"),
                          ("ClearPay_Q2_2025.parsed.json", "ClearPay")):
        legacy = normalize_parser_output(_load(name))
        enhanced = normalize_parser_output(_load(name), recall_mode="enhanced")
        assert _gm_basis(legacy, company) == {"quarterly"}
        assert _gm_basis(enhanced, company) == {"quarterly"}


# --- 3.2: restricted client-float cash is excluded into value_normalized (raw preserved) ---

def test_restricted_cash_exclusion_reads_the_declared_amount() -> None:
    text = _load("ClearPay_Q2_2025.parsed.json").combined_text()
    assert _detect_restricted_cash_exclusion(text) == 6_200_000.0
    # A document with no declared exclusion returns None (guards against over-firing).
    assert _detect_restricted_cash_exclusion(
        _load("NovaCloud_Q2_2025.parsed.json").combined_text()) is None
    assert _detect_restricted_cash_exclusion("Cash Balance $10.0M at period end.") is None


def test_enhanced_normalizes_clearpay_cash_and_preserves_raw() -> None:
    legacy = normalize_parser_output(_load("ClearPay_Q2_2025.parsed.json"))
    enhanced = normalize_parser_output(
        _load("ClearPay_Q2_2025.parsed.json"), recall_mode="enhanced")

    legacy_cash = [m for m in legacy.metrics if m.canonical_metric == "cash_balance"]
    enhanced_cash = [m for m in enhanced.metrics if m.canonical_metric == "cash_balance"]

    assert legacy_cash and all(m.value_normalized is None for m in legacy_cash)
    assert enhanced_cash
    for metric in enhanced_cash:
        assert metric.value == 38_400_000.0          # raw balance never overwritten
        assert metric.value_normalized == 32_200_000.0  # $38.4M − $6.2M segregated float


# --- 3.3 / 3.4: the collision is refused, flagged once, and shown in the summary ---

def test_enhanced_export_refuses_gross_margin_basis_collision() -> None:
    enhanced = _build_golden_export("enhanced")
    legacy = _build_golden_export("legacy")

    collisions = [i for i in enhanced.issues if i.code == "basis_collision"]
    assert len(collisions) == 1
    assert collisions[0].canonical_metric == "gross_margin_pct"
    assert not any(i.code == "basis_collision" for i in legacy.issues)

    lender_gm = [m for m in enhanced.metrics
                 if m.company_name == "LendBridge" and m.canonical_metric == "gross_margin_pct"]
    saas_gm = [m for m in enhanced.metrics
               if m.company_name == "NovaCloud" and m.canonical_metric == "gross_margin_pct"]
    assert lender_gm and all(m.comparison_status == "refused" for m in lender_gm)
    assert saas_gm and all(m.comparison_status == "comparable" for m in saas_gm)


def test_summary_shows_refused_comparisons_section_enhanced_only() -> None:
    assert "## Refused comparisons" in render_summary_markdown(
        _build_golden_export("enhanced"))
    assert "## Refused comparisons" not in render_summary_markdown(
        _build_golden_export("legacy"))


def test_basis_collision_issue_carries_the_frozen_period_field() -> None:
    # §A froze `period` on basis_collision (the Refused-comparison panel binds it).
    enhanced = _build_golden_export("enhanced")
    collisions = [i for i in enhanced.issues if i.code == "basis_collision"]
    assert collisions and all(i.period is not None for i in collisions)


# --- 3.3 (correctness): comparability is structural, not a popularity vote ---

def _gm_metric(company: str, source_file: str, basis: str) -> NormalizedMetric:
    return NormalizedMetric(
        company_name=company, period="Q2 2025", canonical_metric="gross_margin_pct",
        value=61.0, unit="percentage", display_value="61%", raw_label="Gross Margin",
        raw_value_text="61%", source_file=source_file, source_snippet="| Gross Margin | 61% |",
        document_type="company_report", confidence=0.98, detection_method="table_row",
        metric_basis=basis, comparison_status="comparable")


def _result(company: str, source_file: str, basis: str) -> NormalizationResult:
    return NormalizationResult(
        source_file=source_file, document_type="company_report", period="Q2 2025",
        companies=[company], metrics=[_gm_metric(company, source_file, basis)], issues=[])


def test_interest_margin_is_refused_even_when_lenders_outnumber_saas() -> None:
    # Two lenders (interest_margin) + one SaaS (quarterly): a popularity vote would make
    # interest_margin the "majority" and wrongly refuse the SaaS row. Structural refusal must
    # refuse BOTH lenders and keep the SaaS gross margin comparable, regardless of counts.
    export = build_metrics_export(
        results=[
            _result("LenderA", "LenderA_Q2_2025.pdf", "interest_margin"),
            _result("LenderB", "LenderB_Q2_2025.pdf", "interest_margin"),
            _result("SaasC", "SaasC_Q2_2025.pdf", "quarterly"),
        ],
        parsed_paths=[GOLDEN_DIR / "LendBridge_Q2_2025.parsed.json"],
        recall_mode="enhanced",
    )

    status = {m.company_name: m.comparison_status for m in export.metrics
              if m.canonical_metric == "gross_margin_pct"}
    assert status["LenderA"] == "refused"
    assert status["LenderB"] == "refused"
    assert status["SaasC"] == "comparable"
    assert sum(1 for i in export.issues if i.code == "basis_collision") == 1
