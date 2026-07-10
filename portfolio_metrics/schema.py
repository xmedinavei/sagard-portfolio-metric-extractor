from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

CanonicalMetric = Literal[
    "revenue_qtr",
    "arr_eop",
    "gross_margin_pct",
    "cash_balance",
    "monthly_burn",
    "headcount",
    "net_revenue_retention_pct",
    "logo_churn_pct",
]

MeasurementUnit = Literal[
    "usd",
    "percentage",
    "count",
    "multiplier",
    "basis_points",
    "unknown",
]

DocumentKind = Literal["company_report", "portfolio_summary"]

# Recall-fix (Phase 0) additive contract types — see case-study/ii-a-backend-fix-plan.md §A.
# These name the values the future monitoring cockpit binds to; enhanced mode populates them.
SectorKind = Literal["saas", "credit", "marketplace", "payments"]
MetricBasis = Literal["quarterly", "period_end", "monthly", "ltm", "interest_margin"]
ComparisonStatus = Literal["comparable", "refused", "unchecked"]


class ProvenanceStrategy(BaseModel):
    """Describes what source-location fidelity the current parser can guarantee."""

    file_level: bool = True
    page_level: bool = False
    snippet_level: bool = False
    description: str


class ExtractedPage(BaseModel):
    """A page-sized extraction unit used by downstream normalization code."""

    page_number: int | None = None
    text: str = ""
    char_count: int = 0

    @classmethod
    def from_text(cls, text: str, page_number: int | None = None) -> "ExtractedPage":
        normalized = text.strip()
        return cls(page_number=page_number, text=normalized, char_count=len(normalized))


class ParserOutput(BaseModel):
    """Stable extraction contract shared by all parser implementations."""

    file_name: str
    source_path: str
    requested_parser: Literal["firecrawl", "local"]
    parser_used: Literal["firecrawl", "local"]
    raw_format: Literal["markdown", "text"]
    page_count: int
    pages: list[ExtractedPage]
    provenance: ProvenanceStrategy
    notes: list[str] = Field(default_factory=list)

    def combined_text(self) -> str:
        return "\n\n".join(page.text for page in self.pages if page.text).strip()

    def to_markdown(self) -> str:
        lines = [
            f"# Parsed document: {self.file_name}",
            "",
            f"- Requested parser: `{self.requested_parser}`",
            f"- Effective parser: `{self.parser_used}`",
            f"- Raw format: `{self.raw_format}`",
            f"- Page count: {self.page_count}",
        ]

        lines.extend(
            [
                "",
                "## Provenance",
                "",
                f"- File level: {'yes' if self.provenance.file_level else 'no'}",
                f"- Page level: {'yes' if self.provenance.page_level else 'no'}",
                f"- Snippet level: {'yes' if self.provenance.snippet_level else 'no'}",
                f"- Strategy: {self.provenance.description}",
            ]
        )

        if self.notes:
            lines.extend(["", "## Notes", ""])
            lines.extend(f"- {note}" for note in self.notes)

        lines.extend(["", "## Extracted content"])

        for page in self.pages:
            section_title = (
                f"## Page {page.page_number}"
                if page.page_number is not None
                else "## Parsed content"
            )
            lines.extend(["", section_title, ""])
            lines.append(page.text if page.text else "_No text extracted._")

        return "\n".join(lines).strip() + "\n"


class ValueParseResult(BaseModel):
    """Structured output from deterministic numeric parsing."""

    raw_text: str
    value: float | None = None
    unit: MeasurementUnit = "unknown"
    parsing_method: str | None = None
    confidence: float = 0.0
    notes: list[str] = Field(default_factory=list)
    error: str | None = None


class MetricCandidate(BaseModel):
    """Potential metric/value pair detected in a parsed document."""

    source_file: str
    source_page: int | None = None
    company_name: str | None = None
    period: str | None = None
    canonical_metric: CanonicalMetric | None = None
    raw_label: str
    raw_value_text: str
    matched_alias: str | None = None
    source_snippet: str
    detection_method: Literal["table_row", "narrative"]
    label_confidence: float = 0.0
    notes: list[str] = Field(default_factory=list)


class NormalizedMetric(BaseModel):
    """Canonicalized metric row ready for review or later export."""

    company_name: str
    period: str | None = None
    canonical_metric: CanonicalMetric
    value: float | None = None
    unit: MeasurementUnit
    display_value: str
    raw_label: str
    raw_value_text: str
    source_file: str
    source_page: int | None = None
    source_snippet: str
    document_type: DocumentKind = "company_report"
    confidence: float = 0.0
    parsing_method: str | None = None
    detection_method: Literal["table_row", "narrative"]
    metric_basis: MetricBasis | None = None
    notes: list[str] = Field(default_factory=list)
    is_valid: bool = True
    parse_error: str | None = None
    # Recall-fix (Phase 0) additive frontend-contract fields; None in legacy, populated in enhanced.
    sector: SectorKind | None = None
    value_normalized: float | None = None
    currency: str | None = None
    comparison_status: ComparisonStatus | None = None


class NormalizationIssue(BaseModel):
    """Non-fatal warning or error emitted during Phase 3 normalization."""

    severity: Literal["info", "warning", "error"]
    code: str
    message: str
    source_file: str
    source_page: int | None = None
    company_name: str | None = None
    canonical_metric: CanonicalMetric | None = None
    raw_label: str | None = None
    raw_value_text: str | None = None
    # Recall-fix (Phase 0) additive reconciliation-panel fields; None in legacy, populated in enhanced.
    period: str | None = None
    expected_value: float | None = None
    observed_value: float | None = None
    delta: float | None = None


class NormalizationResult(BaseModel):
    """Full Phase 3 result for a single parsed document."""

    source_file: str
    document_type: DocumentKind
    period: str | None = None
    companies: list[str] = Field(default_factory=list)
    metrics: list[NormalizedMetric] = Field(default_factory=list)
    issues: list[NormalizationIssue] = Field(default_factory=list)


class ExportMetadata(BaseModel):
    """Metadata for the canonical Phase 4 metrics export."""

    schema_version: str
    generated_at: datetime
    generator_name: str
    generator_version: str
    source_parsed_artifacts: list[str] = Field(default_factory=list)
    document_count: int = 0
    metric_count: int = 0
    valid_metric_count: int = 0
    invalid_metric_count: int = 0
    issue_count: int = 0
    core_metrics: list[CanonicalMetric] = Field(default_factory=list)
    optional_metrics: list[CanonicalMetric] = Field(default_factory=list)
    # Recall-fix (Phase 0): which recall mode produced this export ("legacy"|"enhanced").
    recall_mode: str = "legacy"


class MetricsLongExport(BaseModel):
    """Stable Phase 4 export contract for downstream review and reuse."""

    export_metadata: ExportMetadata
    metrics: list[NormalizedMetric] = Field(default_factory=list)
    issues: list[NormalizationIssue] = Field(default_factory=list)
