"""Golden guard for the recall-fix gate (Phase 0).

Proves the retrocompat contract the whole plan rests on: with ``recall_mode="legacy"``
the export is *byte-identical* to the committed 1.0.0 baseline across all 24 corpus
documents and all three artifacts (JSON / CSV / summary), while ``recall_mode="enhanced"``
emits the additive 1.1.0 frontend-contract fields. The timestamp is pinned so the
comparison is deterministic.

The committed baselines under ``tests/golden/`` were verified byte-identical to the
genuine pre-change (git HEAD) 1.0.0 output — they are an independent baseline, not a
self-referential lock. Regenerate them intentionally (e.g. the Phase 5 cutover) by
re-running the same build with a fixed ``generated_at``.
"""
from __future__ import annotations

import json
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import pytest

from portfolio_metrics.cli import build_normalize_report, build_parser, normalize_documents
from portfolio_metrics.publish import (
    build_metrics_export,
    render_summary_markdown,
    _serialize_export,
    _write_csv_atomically,
)

GOLDEN_DIR = Path(__file__).parent / "golden"
PARSED_DIR = GOLDEN_DIR / "parsed"
GOLDEN_JSON = GOLDEN_DIR / "metrics_long.legacy.json"
GOLDEN_CSV = GOLDEN_DIR / "metrics_long.legacy.csv"
GOLDEN_SUMMARY = GOLDEN_DIR / "summary.legacy.md"
# Enhanced (1.1.0) baselines — the new default output after the Phase 5 cutover. Locking
# these byte-for-byte makes the now-default enhanced export a reproducible canary too, so
# any future drift in the default output is caught, not just legacy regressions.
GOLDEN_JSON_ENHANCED = GOLDEN_DIR / "metrics_long.enhanced.json"
GOLDEN_CSV_ENHANCED = GOLDEN_DIR / "metrics_long.enhanced.csv"
GOLDEN_SUMMARY_ENHANCED = GOLDEN_DIR / "summary.enhanced.md"
FIXED_GENERATED_AT = datetime(2020, 1, 1, tzinfo=timezone.utc)

# Fields introduced by the recall fix; they must NOT appear in legacy output. `"period"`
# is intentionally omitted — it is a pre-existing NormalizedMetric field that legitimately
# appears on metrics (the exclude only removes the new issue-level period).
_ENHANCED_ONLY_MARKERS = (
    '"sector"',
    '"value_normalized"',
    '"currency"',
    '"comparison_status"',
    '"recall_mode"',
    '"expected_value"',
    '"observed_value"',
    '"delta"',
)


def _golden_paths() -> list[Path]:
    paths = sorted(PARSED_DIR.glob("*.parsed.json"))
    assert len(paths) == 24, f"expected 24 committed golden inputs, got {len(paths)}"
    return paths


def _build_export(recall_mode: str):
    paths = _golden_paths()
    results, failures = normalize_documents(paths, recall_mode=recall_mode)
    assert not failures, failures
    return build_metrics_export(
        results=results,
        parsed_paths=paths,
        generated_at=FIXED_GENERATED_AT,
        recall_mode=recall_mode,
    )


def _csv_text(export, *, enhanced: bool) -> str:
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "metrics_long.csv"
        _write_csv_atomically(out, export.metrics, enhanced=enhanced)
        return out.read_text(encoding="utf-8")


def _normalize_report_json(recall_mode: str) -> str:
    results, failures = normalize_documents(_golden_paths(), recall_mode=recall_mode)
    report = build_normalize_report(
        input_dir=PARSED_DIR, results=results, failures=failures, recall_mode=recall_mode)
    return json.dumps(report)


# --- legacy byte-identity across all three publish artifacts (24-doc corpus) ---

def test_legacy_json_is_byte_identical_to_golden() -> None:
    produced = _serialize_export(_build_export("legacy"))
    assert produced == GOLDEN_JSON.read_text(encoding="utf-8"), (
        "legacy JSON drifted from tests/golden/metrics_long.legacy.json — "
        "a non-opted-in change leaked into default output"
    )


def test_legacy_csv_is_byte_identical_to_golden() -> None:
    produced = _csv_text(_build_export("legacy"), enhanced=False)
    assert produced == GOLDEN_CSV.read_text(encoding="utf-8"), "legacy CSV drifted from golden"


def test_legacy_summary_is_byte_identical_to_golden() -> None:
    produced = render_summary_markdown(_build_export("legacy"))
    assert produced == GOLDEN_SUMMARY.read_text(encoding="utf-8"), "legacy summary.md drifted from golden"


def test_legacy_json_omits_enhanced_contract_fields() -> None:
    produced = _serialize_export(_build_export("legacy"))
    for marker in _ENHANCED_ONLY_MARKERS:
        assert marker not in produced, f"legacy export leaked enhanced field {marker}"
    assert '"schema_version": "1.0.0"' in produced


# --- the second JSON surface: `normalize --format json` report (F1 regression guard) ---

def test_legacy_normalize_report_omits_enhanced_fields() -> None:
    produced = _normalize_report_json("legacy")
    for marker in _ENHANCED_ONLY_MARKERS:
        assert marker not in produced, f"legacy normalize report leaked {marker}"


def test_enhanced_normalize_report_includes_enhanced_fields() -> None:
    produced = _normalize_report_json("enhanced")
    assert '"sector"' in produced and '"comparison_status"' in produced


# --- enhanced emits the 1.1.0 superset (metrics, issues, csv) ---

def test_enhanced_json_emits_the_1_1_0_contract() -> None:
    produced = _serialize_export(_build_export("enhanced"))
    assert '"schema_version": "1.1.0"' in produced
    assert '"recall_mode": "enhanced"' in produced
    # §A metric.sector is populated in enhanced (Phase 2 — the cockpit "route the lender
    # out" bind target). Remaining new fields stay null until their producing phase
    # (value_normalized: Phase 3; expected/observed/delta: Phase 4).
    assert '"sector": "credit"' in produced  # LendBridge routed out
    assert '"sector": "saas"' in produced
    for marker in ('"value_normalized": null',
                   '"expected_value": null', '"observed_value": null', '"delta": null'):
        assert marker in produced, f"enhanced export missing contract field {marker}"


def test_enhanced_populates_phase3_and_phase4_fields_on_golden_corpus() -> None:
    # E2E proof over all 24 docs that the P3/P4 producers actually fire on the real corpus.
    produced = _serialize_export(_build_export("enhanced"))
    # Phase 3: ClearPay restricted-cash exclusion → normalized cash beside the raw balance.
    assert '"value_normalized": 32200000.0' in produced
    # Phase 3: LendBridge interest-margin basis + the refused cross-basis comparison.
    assert '"metric_basis": "interest_margin"' in produced
    assert '"comparison_status": "refused"' in produced
    assert '"code": "basis_collision"' in produced
    # Phase 4 (D5): MediSight own(27.9M) vs summary(22.4M) surfaces with observed/expected/delta.
    assert '"code": "cross_source_discrepancy"' in produced
    assert '"delta": 5500000.0' in produced


# --- enhanced byte-identity (the new default output, Phase 5 cutover) ---

def test_enhanced_json_is_byte_identical_to_golden() -> None:
    produced = _serialize_export(_build_export("enhanced"))
    assert produced == GOLDEN_JSON_ENHANCED.read_text(encoding="utf-8"), (
        "enhanced JSON drifted from tests/golden/metrics_long.enhanced.json — the "
        "post-cutover default output changed; regenerate the baseline intentionally"
    )


def test_enhanced_csv_is_byte_identical_to_golden() -> None:
    produced = _csv_text(_build_export("enhanced"), enhanced=True)
    assert produced == GOLDEN_CSV_ENHANCED.read_text(encoding="utf-8"), "enhanced CSV drifted from golden"


def test_enhanced_summary_is_byte_identical_to_golden() -> None:
    produced = render_summary_markdown(_build_export("enhanced"))
    assert produced == GOLDEN_SUMMARY_ENHANCED.read_text(encoding="utf-8"), "enhanced summary.md drifted from golden"


def test_enhanced_csv_has_contract_columns_and_legacy_does_not() -> None:
    enhanced_header = _csv_text(_build_export("enhanced"), enhanced=True).splitlines()[0]
    legacy_header = _csv_text(_build_export("legacy"), enhanced=False).splitlines()[0]
    for col in ("sector", "value_normalized", "currency", "comparison_status"):
        assert col in enhanced_header, f"enhanced CSV missing column {col}"
        assert col not in legacy_header, f"legacy CSV leaked column {col}"


# --- CLI flag parse/resolve (0.1 acceptance) ---

def test_recall_mode_flag_parses_and_defaults_to_none() -> None:
    parser = build_parser()
    assert parser.parse_args(["publish", "--input-dir", "x"]).recall_mode is None
    assert parser.parse_args(
        ["publish", "--recall-mode", "enhanced"]).recall_mode == "enhanced"
    with pytest.raises(SystemExit):
        parser.parse_args(["publish", "--recall-mode", "bogus"])
