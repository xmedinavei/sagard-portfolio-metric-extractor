from __future__ import annotations

from typing import Iterable

from .metric_aliases import infer_metric_basis, resolve_candidate_alias
from .parse_values import parse_value_text
from .schema import (
    DocumentKind,
    MetricCandidate,
    NormalizationIssue,
    NormalizedMetric,
)


def normalize_candidates(
    candidates: Iterable[MetricCandidate],
    *,
    document_type: DocumentKind,
    recall_mode: str = "legacy",
) -> tuple[list[NormalizedMetric], list[NormalizationIssue]]:
    """Turn detected candidates into conservative canonical metrics."""

    provisional_metrics: list[NormalizedMetric] = []
    issues: list[NormalizationIssue] = []

    for candidate in candidates:
        alias = resolve_candidate_alias(
            candidate.raw_label, candidate.matched_alias)
        if alias is None or candidate.canonical_metric is None:
            continue

        parsed = parse_value_text(
            candidate.raw_value_text, unit_hint=alias.unit)
        notes = [*candidate.notes, *parsed.notes]
        if document_type == "portfolio_summary":
            notes.append(
                "Extracted from a portfolio summary document; standalone company reports should take precedence when deduplicating across sources."
            )

        metric = NormalizedMetric(
            company_name=candidate.company_name or "Unknown",
            period=candidate.period,
            canonical_metric=candidate.canonical_metric,
            value=parsed.value,
            unit=parsed.unit if parsed.value is not None else alias.unit,
            display_value=candidate.raw_value_text,
            raw_label=candidate.raw_label,
            raw_value_text=candidate.raw_value_text,
            source_file=candidate.source_file,
            source_page=candidate.source_page,
            source_snippet=candidate.source_snippet,
            document_type=document_type,
            confidence=_combine_confidence(
                label_confidence=candidate.label_confidence,
                parse_confidence=parsed.confidence,
                parse_success=parsed.error is None,
            ),
            parsing_method=parsed.parsing_method,
            detection_method=candidate.detection_method,
            metric_basis=infer_metric_basis(candidate.raw_label, alias),
            notes=notes,
            is_valid=parsed.error is None and parsed.value is not None,
            parse_error=parsed.error,
        )
        provisional_metrics.append(metric)

        if parsed.error is not None:
            issues.append(
                NormalizationIssue(
                    severity="warning",
                    code="parse_failure",
                    message=(
                        f"Detected `{candidate.raw_label}` but could not parse `{candidate.raw_value_text}`: {parsed.error}"
                    ),
                    source_file=candidate.source_file,
                    source_page=candidate.source_page,
                    company_name=candidate.company_name,
                    canonical_metric=candidate.canonical_metric,
                    raw_label=candidate.raw_label,
                    raw_value_text=candidate.raw_value_text,
                )
            )

    deduped_metrics, conflict_issues = _resolve_conflicts(provisional_metrics)
    issues.extend(conflict_issues)
    return deduped_metrics, issues


def _combine_confidence(*, label_confidence: float, parse_confidence: float, parse_success: bool) -> float:
    if not parse_success:
        return round(max(0.25, min(0.75, label_confidence * 0.55)), 4)
    return round(min(0.995, (label_confidence * parse_confidence) + 0.02), 4)


def _resolve_conflicts(
    metrics: Iterable[NormalizedMetric],
) -> tuple[list[NormalizedMetric], list[NormalizationIssue]]:
    selected: dict[tuple[str, str | None, str], NormalizedMetric] = {}
    issues: list[NormalizationIssue] = []

    for metric in metrics:
        key = (metric.company_name, metric.period, metric.canonical_metric)
        chosen = selected.get(key)
        if chosen is None:
            selected[key] = metric
            continue

        keep_new = _metric_rank(metric) > _metric_rank(chosen)
        retained = metric if keep_new else chosen
        suppressed = chosen if keep_new else metric
        selected[key] = retained

        identical_value = retained.value == suppressed.value and retained.raw_value_text == suppressed.raw_value_text
        issue_code = "duplicate_candidate" if identical_value else "conflicting_candidates"
        severity = "info" if identical_value else "warning"
        message = (
            f"Retained `{retained.raw_label}` = {retained.raw_value_text} over `{suppressed.raw_label}` = {suppressed.raw_value_text}."
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
            )
        )

    return sorted(
        selected.values(),
        key=lambda metric: (metric.company_name,
                            metric.source_page or 0, metric.canonical_metric),
    ), issues


def _metric_rank(metric: NormalizedMetric) -> tuple[int, int, float, int]:
    return (
        1 if metric.is_valid else 0,
        1 if metric.detection_method == "table_row" else 0,
        metric.confidence,
        1 if metric.source_page is not None else 0,
    )
