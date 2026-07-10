"""Phase 4 — D5 cross-validation flag (behind the gate).

Proves the reconciliation panel gets a louder, structured own-vs-summary discrepancy
signal WITHOUT changing the winner (company-report still wins — company-wins is kept). The
§A semantics are locked: observed = retained (own report), expected = suppressed (summary),
delta = observed − expected. Legacy emits only the existing conflict issue; identical values
never raise a discrepancy. Mirrors the NovaCloud conflict precedent in test_publish.py.
"""
from __future__ import annotations

from pathlib import Path

from portfolio_metrics.publish import build_metrics_export
from portfolio_metrics.schema import NormalizationResult, NormalizedMetric

FIXTURE_DIR = Path(__file__).resolve().parents[1] / "tests" / "fixtures" / "parsed"


def _metric(*, source_file: str, doc_type: str, value: float, text: str) -> NormalizedMetric:
    return NormalizedMetric(
        company_name="MediSight",
        period="Q2 2025",
        canonical_metric="arr_eop",
        value=value,
        unit="usd",
        display_value=text,
        raw_label="Contracted ARR (end of period)",
        raw_value_text=text,
        source_file=source_file,
        source_snippet=f"| Contracted ARR (end of period) | {text} |",
        document_type=doc_type,
        confidence=0.99 if doc_type == "company_report" else 0.88,
        detection_method="table_row",
    )


def _results(own_value: float, summary_value: float, *, own_text: str, summary_text: str):
    return [
        NormalizationResult(
            source_file="MediSight_Q2_2025.pdf", document_type="company_report",
            period="Q2 2025", companies=["MediSight"],
            metrics=[_metric(source_file="MediSight_Q2_2025.pdf",
                             doc_type="company_report", value=own_value, text=own_text)],
            issues=[],
        ),
        NormalizationResult(
            source_file="Portfolio_Snapshot_Q2_2025.pdf", document_type="portfolio_summary",
            period="Q2 2025", companies=["MediSight"],
            metrics=[_metric(source_file="Portfolio_Snapshot_Q2_2025.pdf",
                             doc_type="portfolio_summary", value=summary_value, text=summary_text)],
            issues=[],
        ),
    ]


def _export(results, *, recall_mode: str):
    return build_metrics_export(
        results=results,
        parsed_paths=[FIXTURE_DIR / "MediSight_Q2_2025.parsed.json",
                      FIXTURE_DIR / "Portfolio_Snapshot_Q2_2025.parsed.json"],
        recall_mode=recall_mode,
    )


def test_enhanced_emits_cross_source_discrepancy_with_delta() -> None:
    export = _export(
        _results(27_900_000.0, 22_400_000.0, own_text="$27.9M", summary_text="$22.4M"),
        recall_mode="enhanced")

    # Winner is unchanged — the company report (own 27.9M) still wins.
    arr = [m for m in export.metrics if m.canonical_metric == "arr_eop"]
    assert len(arr) == 1
    assert arr[0].value == 27_900_000.0
    assert arr[0].source_file == "MediSight_Q2_2025.pdf"

    # The existing conflict issue is preserved AND the D5 flag is added on top.
    assert any(i.code == "cross_document_conflicting_candidates" for i in export.issues)
    discrepancies = [i for i in export.issues if i.code == "cross_source_discrepancy"]
    assert len(discrepancies) == 1
    flag = discrepancies[0]
    assert flag.observed_value == 27_900_000.0    # retained / own report
    assert flag.expected_value == 22_400_000.0    # suppressed / summary
    assert flag.delta == 5_500_000.0              # observed − expected
    assert flag.company_name == "MediSight"
    assert flag.canonical_metric == "arr_eop"


def test_legacy_emits_only_the_existing_conflict_not_the_discrepancy() -> None:
    export = _export(
        _results(27_900_000.0, 22_400_000.0, own_text="$27.9M", summary_text="$22.4M"),
        recall_mode="legacy")

    assert any(i.code == "cross_document_conflicting_candidates" for i in export.issues)
    assert not any(i.code == "cross_source_discrepancy" for i in export.issues)


def test_identical_values_never_raise_a_discrepancy_even_in_enhanced() -> None:
    export = _export(
        _results(27_900_000.0, 27_900_000.0, own_text="$27.9M", summary_text="$27.9M"),
        recall_mode="enhanced")

    # Same value from both sources is a silent agreement, not a discrepancy.
    assert not any(i.code == "cross_source_discrepancy" for i in export.issues)
    assert any(i.code == "cross_document_duplicate" for i in export.issues)


def test_discrepancy_with_an_unparsed_value_emits_null_delta_without_crashing() -> None:
    # One side failed to parse (value=None) but the raw text differs — still a conflict, so
    # the D5 flag must fire with delta=None rather than raising on the subtraction.
    own = _metric(source_file="MediSight_Q2_2025.pdf",
                  doc_type="company_report", value=27_900_000.0, text="$27.9M")
    summary = _metric(source_file="Portfolio_Snapshot_Q2_2025.pdf",
                      doc_type="portfolio_summary", value=None, text="N/A")
    results = [
        NormalizationResult(source_file="MediSight_Q2_2025.pdf", document_type="company_report",
                            period="Q2 2025", companies=["MediSight"], metrics=[own], issues=[]),
        NormalizationResult(source_file="Portfolio_Snapshot_Q2_2025.pdf", document_type="portfolio_summary",
                            period="Q2 2025", companies=["MediSight"], metrics=[summary], issues=[]),
    ]
    export = _export(results, recall_mode="enhanced")

    discrepancies = [i for i in export.issues if i.code == "cross_source_discrepancy"]
    assert len(discrepancies) == 1
    assert discrepancies[0].observed_value == 27_900_000.0
    assert discrepancies[0].expected_value is None
    assert discrepancies[0].delta is None
