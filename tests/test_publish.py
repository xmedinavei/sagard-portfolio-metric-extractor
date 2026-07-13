from __future__ import annotations

import csv
import json
from pathlib import Path

from portfolio_metrics.cli import main
from portfolio_metrics.publish import build_metrics_export
from portfolio_metrics.schema import MetricsLongExport, NormalizationResult, NormalizedMetric

PROJECT_ROOT = Path(__file__).resolve().parents[1]
FIXTURE_DIR = PROJECT_ROOT / "tests" / "fixtures" / "parsed"


def test_publish_command_writes_phase4_json_artifact(tmp_path: Path, capsys) -> None:
    exit_code = main(
        [
            "publish",
            "--input-dir",
            str(FIXTURE_DIR),
            "--output-dir",
            str(tmp_path),
        ]
    )
    captured = capsys.readouterr()

    export_path = tmp_path / "metrics_long.json"

    assert exit_code == 0
    assert "Phase 4 publish: ready" in captured.out
    assert export_path.exists()

    payload = json.loads(export_path.read_text(encoding="utf-8"))
    export = MetricsLongExport.model_validate(payload)

    assert export.export_metadata.document_count == 3
    assert export.export_metadata.metric_count == len(export.metrics)
    assert export.export_metadata.issue_count == len(export.issues)
    assert "NovaCloud_Q2_2025.parsed.json" in export.export_metadata.source_parsed_artifacts
    assert any(
        metric.canonical_metric == "revenue_qtr" and metric.value == 8_400_000.0
        for metric in export.metrics
    )
    assert any(issue.code == "missing_metric" for issue in export.issues)


def test_publish_command_can_write_csv_and_summary(tmp_path: Path, capsys) -> None:
    exit_code = main(
        [
            "publish",
            str(FIXTURE_DIR / "NovaCloud_Q2_2025.parsed.json"),
            "--output-dir",
            str(tmp_path),
            "--include-csv",
            "--include-summary",
        ]
    )
    captured = capsys.readouterr()

    json_path = tmp_path / "metrics_long.json"
    csv_path = tmp_path / "metrics_long.csv"
    summary_path = tmp_path / "summary.md"

    assert exit_code == 0
    assert "json:" in captured.out
    assert "csv:" in captured.out
    assert "summary:" in captured.out
    assert json_path.exists()
    assert csv_path.exists()
    assert summary_path.exists()

    payload = json.loads(json_path.read_text(encoding="utf-8"))
    with csv_path.open(encoding="utf-8", newline="") as handle:
        rows = list(csv.DictReader(handle))

    assert len(rows) == len(payload["metrics"])
    assert {"company_name", "canonical_metric", "source_file", "confidence"}.issubset(
        rows[0].keys()
    )

    summary = summary_path.read_text(encoding="utf-8")
    assert "# Portfolio metrics export summary" in summary
    assert "NovaCloud_Q2_2025.pdf" in summary


def test_build_metrics_export_prefers_company_report_over_portfolio_summary_duplicates() -> None:
    company_metric = NormalizedMetric(
        company_name="NovaCloud",
        period="Q2 2025",
        canonical_metric="revenue_qtr",
        value=8_400_000.0,
        unit="usd",
        display_value="$8.4M",
        raw_label="Recognized Revenue",
        raw_value_text="$8.4M",
        source_file="NovaCloud_Q2_2025.pdf",
        source_snippet="| Recognized Revenue | $8.4M |",
        document_type="company_report",
        confidence=0.995,
        detection_method="table_row",
    )
    snapshot_metric = NormalizedMetric(
        company_name="NovaCloud",
        period="Q2 2025",
        canonical_metric="revenue_qtr",
        value=8_100_000.0,
        unit="usd",
        display_value="$8.1M",
        raw_label="Recognized Revenue",
        raw_value_text="$8.1M",
        source_file="Portfolio_Snapshot_Q2_2025.pdf",
        source_snippet="| Recognized Revenue | $8.1M |",
        document_type="portfolio_summary",
        confidence=0.88,
        detection_method="table_row",
    )
    results = [
        NormalizationResult(
            source_file="NovaCloud_Q2_2025.pdf",
            document_type="company_report",
            period="Q2 2025",
            companies=["NovaCloud"],
            metrics=[company_metric],
            issues=[],
        ),
        NormalizationResult(
            source_file="Portfolio_Snapshot_Q2_2025.pdf",
            document_type="portfolio_summary",
            period="Q2 2025",
            companies=["NovaCloud"],
            metrics=[snapshot_metric],
            issues=[],
        ),
    ]

    export = build_metrics_export(
        results=results,
        parsed_paths=[
            FIXTURE_DIR / "NovaCloud_Q2_2025.parsed.json",
            FIXTURE_DIR / "Portfolio_Snapshot_Q2_2025.parsed.json",
        ],
    )

    assert len(export.metrics) == 1
    assert export.metrics[0].source_file == "NovaCloud_Q2_2025.pdf"
    assert any(
        issue.code == "cross_document_conflicting_candidates" for issue in export.issues)


def test_publish_command_dedupes_snapshot_metrics_against_company_reports(tmp_path: Path, capsys) -> None:
    exit_code = main(
        [
            "publish",
            str(FIXTURE_DIR / "NovaCloud_Q2_2025.parsed.json"),
            str(FIXTURE_DIR / "Portfolio_Snapshot_Q2_2025.parsed.json"),
            "--output-dir",
            str(tmp_path),
            "--format",
            "json",
        ]
    )
    capsys.readouterr()

    payload = json.loads(
        (tmp_path / "metrics_long.json").read_text(encoding="utf-8"))

    assert exit_code == 0
    metric_rows = [
        metric
        for metric in payload["metrics"]
        if metric["company_name"] == "NovaCloud"
        and metric["period"] == "Q2 2025"
        and metric["canonical_metric"] == "revenue_qtr"
    ]
    assert len(metric_rows) == 1
    assert metric_rows[0]["source_file"] == "NovaCloud_Q2_2025.pdf"


def test_publish_command_can_emit_json_report(tmp_path: Path, capsys) -> None:
    # Legacy guard (Phase 5 cutover): this test proves the --format json report *shape*
    # (counts + ready + artifacts). Its `issue_count > 0` assertion relies on the
    # sector-blind "missing metric" alarms a lone LendBridge doc raises in legacy — which
    # enhanced (now the default) correctly suppresses (LendBridge is credit, routed out).
    # Pin to legacy so the shape check stays deterministic; the enhanced suppression is
    # covered by test_sector_profiles / test_cli_normalize's enhanced cases.
    exit_code = main(
        [
            "publish",
            str(FIXTURE_DIR / "LendBridge_Q2_2025.parsed.json"),
            "--output-dir",
            str(tmp_path),
            "--recall-mode",
            "legacy",
            "--format",
            "json",
        ]
    )
    captured = capsys.readouterr()

    payload = json.loads(captured.out)

    assert exit_code == 0
    assert payload["processed_count"] == 1
    assert payload["failure_count"] == 0
    assert payload["metric_count"] > 0
    assert payload["issue_count"] > 0
    assert payload["ready"] is True
    assert payload["artifacts"]["json_output"].endswith("metrics_long.json")


def test_publish_command_handles_empty_input_dir(tmp_path: Path, capsys) -> None:
    input_dir = tmp_path / "empty"
    output_dir = tmp_path / "out"
    input_dir.mkdir()

    exit_code = main(
        [
            "publish",
            "--input-dir",
            str(input_dir),
            "--output-dir",
            str(output_dir),
            "--format",
            "json",
        ]
    )
    captured = capsys.readouterr()

    payload = json.loads(captured.out)

    assert exit_code == 1
    assert payload["processed_count"] == 0
    assert payload["failure_count"] == 1
    assert payload["ready"] is False
    assert "No parsed JSON inputs were resolved" in payload["failures"][0]["error"]
    assert not (output_dir / "metrics_long.json").exists()
