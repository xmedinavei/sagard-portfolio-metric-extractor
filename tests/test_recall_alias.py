"""Phase 1 — Class A+B alias recovery + footnote stitching (behind the recall-mode gate).

Proves the enhanced path recovers word-order / synonym label drift and footnote-declared
equivalences, that the wrong MediSight value is fixed by the same alias work (own-report
27.9M outranks the summary 22.4M and raises the conflict flag), and that none of it leaks
into legacy. Negative fixtures guard against over-capture. Test corpus is the committed
tests/golden/parsed/ set (real drifted labels) — no new fixtures added, so the exact
tests/fixtures/parsed/ inventory pinned by test_cli_normalize stays intact.
"""
from __future__ import annotations

import json
from pathlib import Path

from portfolio_metrics.metric_aliases import (
    EXTENDED_ALIASES,
    _ALIAS_BY_LABEL,
    find_alias_for_label,
    find_label_equivalences,
    normalize_label_text,
)
from portfolio_metrics.pipeline import normalize_parser_output
from portfolio_metrics.publish import build_metrics_export
from portfolio_metrics.schema import ParserOutput

GOLDEN_DIR = Path(__file__).resolve().parents[0] / "golden" / "parsed"


def _load(name: str) -> ParserOutput:
    return ParserOutput.model_validate(
        json.loads((GOLDEN_DIR / name).read_text(encoding="utf-8")))


def _values(result, company: str, metric: str) -> list[float]:
    return [m.value for m in result.metrics
            if m.company_name == company and m.canonical_metric == metric]


# --- 1.2: extended alias rows are collision-free with the frozen table ---

def test_extended_alias_keys_are_collision_free_with_legacy_table() -> None:
    for alias in EXTENDED_ALIASES:
        key = normalize_label_text(alias.label)
        assert key not in _ALIAS_BY_LABEL, (
            f"extended alias {alias.label!r} collides with a frozen legacy key")


# --- 1.1 / 1.2: enhanced recovers drifted ARR; legacy drops it ---

def test_enhanced_recovers_novacloud_end_of_period_arr() -> None:
    legacy = normalize_parser_output(_load("NovaCloud_Q1_2025.parsed.json"))
    enhanced = normalize_parser_output(
        _load("NovaCloud_Q1_2025.parsed.json"), recall_mode="enhanced")

    assert _values(legacy, "NovaCloud", "arr_eop") == []
    assert _values(enhanced, "NovaCloud", "arr_eop") == [31_600_000.0]


def test_enhanced_lifts_novacloud_arr_from_one_to_five_quarters() -> None:
    # Demo insight #1: legacy captures NovaCloud ARR in exactly one quarter (the only doc
    # using the recognized "ARR (End of Period)" label); enhanced recovers all five.
    quarters = {
        "NovaCloud_Q2_2024.parsed.json": 24_100_000.0,
        "NovaCloud_Q3_2024.parsed.json": 26_800_000.0,
        "NovaCloud_Q4_2024.parsed.json": 29_100_000.0,
        "NovaCloud_Q1_2025.parsed.json": 31_600_000.0,
        "NovaCloud_Q2_2025.parsed.json": 34_200_000.0,
    }
    legacy_hits = 0
    for name, expected in quarters.items():
        assert _values(normalize_parser_output(_load(name), recall_mode="enhanced"),
                       "NovaCloud", "arr_eop") == [expected], name
        legacy_hits += bool(_values(normalize_parser_output(_load(name)),
                                    "NovaCloud", "arr_eop"))
    assert legacy_hits == 1  # legacy sees only the one recognized-label quarter


def test_footnote_equivalence_parser_handles_quoted_and_unquoted_labels() -> None:
    # The corpus writes equivalences mostly as "'X' is equivalent to 'Y'"; both the quoted
    # and bare forms must parse, and a definition footnote (no "equivalent to") must not.
    assert find_label_equivalences(
        "(1) 'Contracted Annual Recurring Revenue' is equivalent to 'Contracted ARR' used in prior quarters."
    ) == [("Contracted Annual Recurring Revenue", "Contracted ARR")]
    assert find_label_equivalences(
        "(1) Net Revenue is equivalent to Recognized Revenue in prior periods."
    ) == [("Net Revenue", "Recognized Revenue")]
    assert find_label_equivalences(
        "(1) Total Billings includes all revenue recognized under ASC 606.") == []


def test_enhanced_recovers_mediSight_contracted_arr_end_of_period() -> None:
    legacy = normalize_parser_output(_load("MediSight_Q2_2025.parsed.json"))
    enhanced = normalize_parser_output(
        _load("MediSight_Q2_2025.parsed.json"), recall_mode="enhanced")

    assert _values(legacy, "MediSight", "arr_eop") == []
    assert _values(enhanced, "MediSight", "arr_eop") == [27_900_000.0]


# --- 1.3: footnote-declared equivalence is stitched; undeclared drift is not ---

def test_enhanced_stitches_declared_net_revenue_equivalence() -> None:
    # NovaCloud Q4 footnote: "Net Revenue is equivalent to Recognized Revenue".
    legacy = normalize_parser_output(_load("NovaCloud_Q4_2024.parsed.json"))
    enhanced = normalize_parser_output(
        _load("NovaCloud_Q4_2024.parsed.json"), recall_mode="enhanced")

    assert _values(legacy, "NovaCloud", "revenue_qtr") == []
    assert _values(enhanced, "NovaCloud", "revenue_qtr") == [7_200_000.0]


def test_undeclared_total_billings_drift_is_not_stitched() -> None:
    # NovaCloud Q2 2024's "Total Billings" footnote is a definition, not an equivalence —
    # so it stays honestly dropped even in enhanced mode (the thesis: recover the provable).
    enhanced = normalize_parser_output(
        _load("NovaCloud_Q2_2024.parsed.json"), recall_mode="enhanced")
    assert all(m.raw_label != "Total Billings(USD)" for m in enhanced.metrics)


# --- 1.4: negatives never map to arr_eop, in either mode (over-capture guard) ---

def test_sibling_arr_labels_never_map_to_arr_eop() -> None:
    for label in ("ARR Growth (YoY)", "Expansion ARR as % of Total ARR"):
        assert find_alias_for_label(label) is None
        assert find_alias_for_label(label, enhanced=True) is None


# --- Class B: the same alias work fixes the wrong value + surfaces the conflict ---

def test_enhanced_mediSight_own_report_outranks_summary_and_flags_conflict() -> None:
    medi = normalize_parser_output(
        _load("MediSight_Q2_2025.parsed.json"), recall_mode="enhanced")
    snap = normalize_parser_output(
        _load("Portfolio_Snapshot_Q2_2025.parsed.json"), recall_mode="enhanced")
    export = build_metrics_export(
        results=[medi, snap],
        parsed_paths=[GOLDEN_DIR / "MediSight_Q2_2025.parsed.json",
                      GOLDEN_DIR / "Portfolio_Snapshot_Q2_2025.parsed.json"],
        recall_mode="enhanced",
    )

    arr = [m for m in export.metrics
           if m.company_name == "MediSight" and m.canonical_metric == "arr_eop"]
    assert len(arr) == 1
    assert arr[0].value == 27_900_000.0
    assert arr[0].source_file == "MediSight_Q2_2025.pdf"
    assert any(
        issue.code == "cross_document_conflicting_candidates"
        and issue.company_name == "MediSight"
        and issue.canonical_metric == "arr_eop"
        for issue in export.issues
    )


def test_legacy_mediSight_arr_is_only_the_wrong_summary_value() -> None:
    # The documented "before": legacy never captures the own-report 27.9M, so the summary's
    # transcription-swapped 22.4M is the sole survivor and no conflict is raised.
    medi = normalize_parser_output(_load("MediSight_Q2_2025.parsed.json"))
    snap = normalize_parser_output(_load("Portfolio_Snapshot_Q2_2025.parsed.json"))
    export = build_metrics_export(
        results=[medi, snap],
        parsed_paths=[GOLDEN_DIR / "MediSight_Q2_2025.parsed.json",
                      GOLDEN_DIR / "Portfolio_Snapshot_Q2_2025.parsed.json"],
    )

    arr = [m for m in export.metrics
           if m.company_name == "MediSight" and m.canonical_metric == "arr_eop"]
    assert len(arr) == 1
    assert arr[0].value == 22_400_000.0
    assert arr[0].source_file == "Portfolio_Snapshot_Q2_2025.pdf"
