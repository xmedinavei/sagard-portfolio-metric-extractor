from __future__ import annotations

import csv
import os
import tempfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

from . import __version__
from .metric_aliases import CORE_METRICS, OPTIONAL_METRICS
from .schema import (
    ExportMetadata,
    MetricsLongExport,
    NormalizationIssue,
    NormalizationResult,
    NormalizedMetric,
)

EXPORT_SCHEMA_VERSION = "1.0.0"
# Recall-fix (Phase 0): enhanced mode emits the 1.1.0 superset contract (see §A); legacy stays 1.0.0.
EXPORT_SCHEMA_VERSION_ENHANCED = "1.1.0"
CSV_FIELDNAMES: tuple[str, ...] = (
    "company_name",
    "period",
    "canonical_metric",
    "value",
    "unit",
    "display_value",
    "raw_label",
    "raw_value_text",
    "source_file",
    "source_page",
    "source_snippet",
    "document_type",
    "confidence",
    "parsing_method",
    "detection_method",
    "metric_basis",
    "is_valid",
    "parse_error",
    "notes",
)
# Recall-fix (Phase 0): enhanced mode appends the frontend-contract columns; legacy keeps the 1.0.0 set.
_ENHANCED_CSV_COLUMNS: tuple[str, ...] = (
    "sector",
    "value_normalized",
    "currency",
    "comparison_status",
)
CSV_FIELDNAMES_ENHANCED: tuple[str, ...] = CSV_FIELDNAMES + _ENHANCED_CSV_COLUMNS
# Fields absent from the frozen 1.0.0 export; excluded from legacy serialization so legacy stays byte-identical.
_LEGACY_METRIC_EXCLUDE = {"sector", "value_normalized", "currency", "comparison_status"}
_LEGACY_ISSUE_EXCLUDE = {"period", "expected_value", "observed_value", "delta"}
# Exclusion for a single NormalizationResult (metrics[] + issues[]) — reused by the CLI normalize report.
LEGACY_RESULT_EXCLUDE = {
    "metrics": {"__all__": _LEGACY_METRIC_EXCLUDE},
    "issues": {"__all__": _LEGACY_ISSUE_EXCLUDE},
}
LEGACY_JSON_EXCLUDE = {
    "export_metadata": {"recall_mode"},
    **LEGACY_RESULT_EXCLUDE,
}
# Recall-fix (Phase 3): reporting bases that are structurally non-comparable to an ordinary
# product/COGS margin — a lender's interest margin can never anchor a comparable cohort, no
# matter how many lenders are present. Used by the refuse-to-compare (basis_collision) scan.
_ISOLATED_BASES: frozenset[str] = frozenset({"interest_margin"})


@dataclass(frozen=True, slots=True)
class WrittenPublishArtifacts:
    export: MetricsLongExport
    json_path: Path
    csv_path: Path | None = None
    summary_path: Path | None = None


def build_metrics_export(
    *,
    results: Iterable[NormalizationResult],
    parsed_paths: Iterable[Path],
    generated_at: datetime | None = None,
    recall_mode: str = "legacy",
) -> MetricsLongExport:
    """Build the canonical Phase 4 export from Phase 3 normalization results."""

    result_list = list(results)
    parsed_artifacts = sorted({path.name for path in parsed_paths})
    metrics = [
        metric.model_copy(deep=True)
        for result in result_list
        for metric in result.metrics
    ]
    issues = [
        issue.model_copy(deep=True)
        for result in result_list
        for issue in result.issues
    ]

    deduped_metrics, dedupe_issues = _dedupe_cross_document_metrics(
        metrics, recall_mode=recall_mode)
    metrics = sorted(deduped_metrics, key=_metric_sort_key)
    # Recall-fix (Phase 3): refuse cross-company comparison of a canonical metric reported
    # on incompatible bases (e.g. a lender's interest-margin gross margin beside SaaS ones).
    # Enhanced only; non-destructive (marks rows + emits an issue, never drops or rewrites).
    collision_issues = (
        _detect_basis_collisions(metrics) if recall_mode == "enhanced" else []
    )
    issues = sorted(
        [*issues, *dedupe_issues, *collision_issues], key=_issue_sort_key)

    valid_metric_count = sum(1 for metric in metrics if metric.is_valid)
    export_metadata = ExportMetadata(
        schema_version=(
            EXPORT_SCHEMA_VERSION_ENHANCED
            if recall_mode == "enhanced"
            else EXPORT_SCHEMA_VERSION
        ),
        generated_at=generated_at or datetime.now(timezone.utc),
        generator_name="portfolio-metrics",
        generator_version=__version__,
        source_parsed_artifacts=parsed_artifacts,
        document_count=len(result_list),
        metric_count=len(metrics),
        valid_metric_count=valid_metric_count,
        invalid_metric_count=len(metrics) - valid_metric_count,
        issue_count=len(issues),
        core_metrics=list(CORE_METRICS),
        optional_metrics=list(OPTIONAL_METRICS),
        recall_mode=recall_mode,
    )
    return MetricsLongExport(
        export_metadata=export_metadata,
        metrics=metrics,
        issues=issues,
    )


def _dedupe_cross_document_metrics(
    metrics: Iterable[NormalizedMetric],
    *,
    recall_mode: str = "legacy",
) -> tuple[list[NormalizedMetric], list[NormalizationIssue]]:
    selected: dict[tuple[str, str | None, str], NormalizedMetric] = {}
    issues: list[NormalizationIssue] = []

    for metric in metrics:
        key = (metric.company_name, metric.period, metric.canonical_metric)
        chosen = selected.get(key)
        if chosen is None:
            selected[key] = metric
            continue

        keep_new = _cross_document_metric_rank(
            metric) > _cross_document_metric_rank(chosen)
        retained = metric if keep_new else chosen
        suppressed = chosen if keep_new else metric
        selected[key] = retained

        identical_value = retained.value == suppressed.value and retained.raw_value_text == suppressed.raw_value_text
        issue_code = "cross_document_duplicate" if identical_value else "cross_document_conflicting_candidates"
        severity = "info" if identical_value else "warning"
        message = (
            f"Retained `{retained.raw_label}` = {retained.raw_value_text} from `{retained.source_file}` "
            f"over `{suppressed.raw_label}` = {suppressed.raw_value_text} from `{suppressed.source_file}`."
        )
        retained.notes.append(message)
        issues.append(
            NormalizationIssue(
                severity=severity,
                code=issue_code,
                message=message,
                source_file=retained.source_file,
                source_page=retained.source_page,
                company_name=retained.company_name,
                canonical_metric=retained.canonical_metric,
                raw_label=suppressed.raw_label,
                raw_value_text=suppressed.raw_value_text,
                # §A reconciliation join key: carry `period` so this presence-marker issue
                # shares the (company, period, canonical_metric) key with its co-emitted
                # `cross_source_discrepancy` sibling below (which also sets period=retained.period).
                # Serializer-gated: `period` is in _LEGACY_ISSUE_EXCLUDE, so legacy stays byte-identical.
                period=retained.period,
            )
        )

        # Recall-fix (Phase 4, D5): when the two sources genuinely disagree, raise a louder
        # cross-validation flag for the reconciliation panel — WITHOUT changing the winner
        # (company-report still wins above). Semantics locked in §A: observed = retained
        # (own/company report), expected = suppressed (summary), delta = observed − expected.
        if recall_mode == "enhanced" and not identical_value:
            delta = (
                round(retained.value - suppressed.value, 6)
                if retained.value is not None and suppressed.value is not None
                else None
            )
            issues.append(
                NormalizationIssue(
                    severity="warning",
                    code="cross_source_discrepancy",
                    message=(
                        f"Cross-source discrepancy for `{retained.canonical_metric}` "
                        f"({retained.company_name}): retained {retained.raw_value_text} from "
                        f"`{retained.source_file}` vs {suppressed.raw_value_text} from "
                        f"`{suppressed.source_file}`."
                    ),
                    source_file=retained.source_file,
                    source_page=retained.source_page,
                    company_name=retained.company_name,
                    canonical_metric=retained.canonical_metric,
                    raw_label=suppressed.raw_label,
                    raw_value_text=suppressed.raw_value_text,
                    period=retained.period,
                    expected_value=suppressed.value,
                    observed_value=retained.value,
                    delta=delta,
                )
            )

    return list(selected.values()), issues


def _detect_basis_collisions(
    metrics: list[NormalizedMetric],
) -> list[NormalizationIssue]:
    """Refuse cross-company comparison of a canonical metric reported on incompatible bases.

    Groups the exported metrics by canonical metric; when a group mixes reporting bases
    (e.g. a lender's ``interest_margin`` ``gross_margin_pct`` beside SaaS ``quarterly`` ones)
    the non-comparable rows are marked ``comparison_status="refused"`` and one
    ``basis_collision`` issue is emitted per group. Non-destructive — no value or dedup key
    is touched. Enhanced only (the caller gates it).

    Comparability is decided **structurally, not by vote**: an isolated basis (a lender's
    interest margin) is categorically non-comparable to an ordinary product margin, so it can
    never be the comparable cohort even if lenders outnumber SaaS. The comparable anchor is
    the most common **non-isolated** basis; every isolated basis and every non-isolated
    minority is refused against it. If every basis is isolated, all rows are refused.
    """

    groups: dict[str, list[NormalizedMetric]] = {}
    for metric in metrics:
        if metric.is_valid and metric.metric_basis is not None:
            groups.setdefault(metric.canonical_metric, []).append(metric)

    issues: list[NormalizationIssue] = []
    for canonical_metric, group in sorted(groups.items()):
        bases = {metric.metric_basis for metric in group}
        if len(bases) < 2:
            continue

        basis_counts: dict[str, int] = {}
        for metric in group:
            basis_counts[metric.metric_basis] = basis_counts.get(
                metric.metric_basis, 0) + 1
        comparable_bases = [b for b in bases if b not in _ISOLATED_BASES]
        if comparable_bases:
            anchor_basis = max(
                sorted(comparable_bases), key=lambda basis: basis_counts[basis])
            refused = [m for m in group if m.metric_basis != anchor_basis]
        else:
            anchor_basis = None
            refused = list(group)

        for metric in refused:
            metric.comparison_status = "refused"

        refused_desc = ", ".join(sorted(
            {f"{metric.company_name} ({metric.metric_basis})" for metric in refused}))
        anchor_desc = (
            f"the comparable `{anchor_basis}` basis" if anchor_basis is not None
            else "each other (no comparable basis)")
        representative = min(
            refused, key=lambda metric: (metric.source_file, metric.company_name, metric.period or ""))
        issues.append(
            NormalizationIssue(
                severity="warning",
                code="basis_collision",
                message=(
                    f"Refused to compare `{canonical_metric}`: {len(refused)} row(s) report "
                    f"a basis incompatible with {anchor_desc} — {refused_desc}."
                ),
                source_file=representative.source_file,
                canonical_metric=canonical_metric,
                # §A frozen contract: basis_collision carries `period` (representative row).
                period=representative.period,
            )
        )
    return issues


def _serialize_export(export: MetricsLongExport) -> str:
    """Serialize the export as JSON, gating enhanced-only fields so legacy output is byte-identical to 1.0.0."""

    if export.export_metadata.recall_mode == "enhanced":
        return export.model_dump_json(indent=2) + "\n"
    return export.model_dump_json(indent=2, exclude=LEGACY_JSON_EXCLUDE) + "\n"


def write_publish_artifacts(
    export: MetricsLongExport,
    output_dir: Path,
    *,
    include_csv: bool = False,
    include_summary: bool = False,
) -> WrittenPublishArtifacts:
    """Persist the Phase 4 JSON artifact and optional review derivatives."""

    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / "metrics_long.json"
    csv_path = output_dir / "metrics_long.csv" if include_csv else None
    summary_path = output_dir / "summary.md" if include_summary else None

    _write_text_atomically(json_path, _serialize_export(export))
    if csv_path is not None:
        _write_csv_atomically(
            csv_path,
            export.metrics,
            enhanced=export.export_metadata.recall_mode == "enhanced",
        )
    if summary_path is not None:
        _write_text_atomically(summary_path, render_summary_markdown(export))

    return WrittenPublishArtifacts(
        export=export,
        json_path=json_path,
        csv_path=csv_path,
        summary_path=summary_path,
    )


def render_summary_markdown(export: MetricsLongExport) -> str:
    """Create a lightweight review summary derived from the canonical JSON export."""

    metadata = export.export_metadata
    lines = [
        "# Portfolio metrics export summary",
        "",
        f"- Generated at: `{_format_timestamp(metadata.generated_at)}`",
        f"- Schema version: `{metadata.schema_version}`",
        f"- Documents processed: {metadata.document_count}",
        (
            "- Metrics exported: "
            f"{metadata.metric_count} ({metadata.valid_metric_count} valid, {metadata.invalid_metric_count} invalid)"
        ),
        f"- Issues carried forward: {metadata.issue_count}",
        "",
        "## Source parsed artifacts",
        "",
    ]

    if metadata.source_parsed_artifacts:
        lines.extend(
            f"- `{artifact}`" for artifact in metadata.source_parsed_artifacts)
    else:
        lines.append("- _No parsed artifacts were included in this export._")

    lines.extend(["", "## Source document coverage", ""])
    summaries = _summaries_by_source(export.metrics, export.issues)
    if not summaries:
        lines.append("- _No metrics were exported._")
        return "\n".join(lines).strip() + "\n"

    for item in summaries:
        companies = ", ".join(
            item["companies"]) if item["companies"] else "n/a"
        lines.append(
            "- "
            f"`{item['source_file']}` — companies={companies}; "
            f"metrics={item['metric_count']} "
            f"(valid={item['valid_metric_count']}, invalid={item['invalid_metric_count']}); "
            f"issues={item['issue_count']}"
        )
        missing_core = item["missing_core_metrics"]
        if missing_core:
            lines.append(
                f"  - missing core metrics: {', '.join(missing_core)}")

    # Recall-fix (Phase 3): surface metrics the tool refused to compare across bases. Empty
    # in legacy (no basis_collision issues are ever emitted), so legacy output is unchanged.
    refused_issues = [
        issue for issue in export.issues if issue.code == "basis_collision"]
    if refused_issues:
        lines.extend(["", "## Refused comparisons", ""])
        for issue in refused_issues:
            lines.append(f"- {issue.message}")

    return "\n".join(lines).strip() + "\n"


def _metric_sort_key(metric: NormalizedMetric) -> tuple[str, str, str, str, int, str, str]:
    return (
        metric.source_file,
        metric.company_name,
        metric.period or "",
        metric.canonical_metric,
        metric.source_page or 0,
        metric.raw_label,
        metric.raw_value_text,
    )


def _issue_sort_key(issue: NormalizationIssue) -> tuple[str, str, str, str, str]:
    return (
        issue.source_file,
        issue.company_name or "",
        issue.canonical_metric or "",
        issue.code,
        issue.message,
    )


def _cross_document_metric_rank(metric: NormalizedMetric) -> tuple[int, int, int, float, int, str]:
    return (
        1 if metric.document_type == "company_report" else 0,
        1 if metric.is_valid else 0,
        1 if metric.detection_method == "table_row" else 0,
        metric.confidence,
        1 if metric.source_page is not None else 0,
        metric.source_file,
    )


def _metric_to_csv_row(metric: NormalizedMetric) -> dict[str, str | float | int]:
    return {
        "company_name": metric.company_name,
        "period": metric.period or "",
        "canonical_metric": metric.canonical_metric,
        "value": "" if metric.value is None else metric.value,
        "unit": metric.unit,
        "display_value": metric.display_value,
        "raw_label": metric.raw_label,
        "raw_value_text": metric.raw_value_text,
        "source_file": metric.source_file,
        "source_page": "" if metric.source_page is None else metric.source_page,
        "source_snippet": _collapse_whitespace(metric.source_snippet),
        "document_type": metric.document_type,
        "confidence": metric.confidence,
        "parsing_method": metric.parsing_method or "",
        "detection_method": metric.detection_method,
        "metric_basis": metric.metric_basis or "",
        "is_valid": "true" if metric.is_valid else "false",
        "parse_error": metric.parse_error or "",
        "notes": " | ".join(_collapse_whitespace(note) for note in metric.notes if note.strip()),
        "sector": metric.sector or "",
        "value_normalized": "" if metric.value_normalized is None else metric.value_normalized,
        "currency": metric.currency or "",
        "comparison_status": metric.comparison_status or "",
    }


def _summaries_by_source(
    metrics: Iterable[NormalizedMetric],
    issues: Iterable[NormalizationIssue],
) -> list[dict[str, object]]:
    summary: dict[str, dict[str, object]] = {}

    for metric in metrics:
        bucket = summary.setdefault(
            metric.source_file,
            {
                "source_file": metric.source_file,
                "companies": set(),
                "metric_count": 0,
                "valid_metric_count": 0,
                "invalid_metric_count": 0,
                "issue_count": 0,
                "missing_core_metrics": set(),
            },
        )
        bucket["metric_count"] = int(bucket["metric_count"]) + 1
        if metric.is_valid:
            bucket["valid_metric_count"] = int(
                bucket["valid_metric_count"]) + 1
        else:
            bucket["invalid_metric_count"] = int(
                bucket["invalid_metric_count"]) + 1
        if metric.company_name:
            companies = bucket["companies"]
            if isinstance(companies, set):
                companies.add(metric.company_name)

    for issue in issues:
        bucket = summary.setdefault(
            issue.source_file,
            {
                "source_file": issue.source_file,
                "companies": set(),
                "metric_count": 0,
                "valid_metric_count": 0,
                "invalid_metric_count": 0,
                "issue_count": 0,
                "missing_core_metrics": set(),
            },
        )
        bucket["issue_count"] = int(bucket["issue_count"]) + 1
        if issue.company_name:
            companies = bucket["companies"]
            if isinstance(companies, set):
                companies.add(issue.company_name)
        if issue.code == "missing_metric" and issue.canonical_metric is not None:
            missing_core_metrics = bucket["missing_core_metrics"]
            if isinstance(missing_core_metrics, set):
                missing_core_metrics.add(issue.canonical_metric)

    normalized: list[dict[str, object]] = []
    for source_file, bucket in sorted(summary.items()):
        companies = bucket["companies"]
        missing_core_metrics = bucket["missing_core_metrics"]
        normalized.append(
            {
                "source_file": source_file,
                "companies": sorted(companies) if isinstance(companies, set) else [],
                "metric_count": int(bucket["metric_count"]),
                "valid_metric_count": int(bucket["valid_metric_count"]),
                "invalid_metric_count": int(bucket["invalid_metric_count"]),
                "issue_count": int(bucket["issue_count"]),
                "missing_core_metrics": sorted(missing_core_metrics)
                if isinstance(missing_core_metrics, set)
                else [],
            }
        )
    return normalized


def _write_csv_atomically(
    csv_path: Path,
    metrics: Iterable[NormalizedMetric],
    *,
    enhanced: bool = False,
) -> None:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = list(CSV_FIELDNAMES_ENHANCED if enhanced else CSV_FIELDNAMES)
    file_descriptor, temp_path = tempfile.mkstemp(
        prefix=f".{csv_path.name}.",
        suffix=".tmp",
        dir=csv_path.parent,
    )
    try:
        with os.fdopen(file_descriptor, "w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(
                handle, fieldnames=fieldnames, extrasaction="ignore")
            writer.writeheader()
            for metric in metrics:
                writer.writerow(_metric_to_csv_row(metric))
        os.replace(temp_path, csv_path)
    except Exception:
        Path(temp_path).unlink(missing_ok=True)
        raise


def _write_text_atomically(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    file_descriptor, temp_path = tempfile.mkstemp(
        prefix=f".{path.name}.",
        suffix=".tmp",
        dir=path.parent,
    )
    try:
        with os.fdopen(file_descriptor, "w", encoding="utf-8") as handle:
            handle.write(content)
        os.replace(temp_path, path)
    except Exception:
        Path(temp_path).unlink(missing_ok=True)
        raise


def _collapse_whitespace(value: str) -> str:
    return " ".join(value.split())


def _format_timestamp(value: datetime) -> str:
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
