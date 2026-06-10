from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from .metric_aliases import NARRATIVE_ALIASES, find_alias_for_label, normalize_label_text
from .parse_values import find_value_token, parse_value_text
from .schema import DocumentKind, MetricCandidate, ParserOutput

_QUARTER_RE = re.compile(r"\b(Q[1-4]\s+20\d{2})\b", re.IGNORECASE)
_DATE_RE = re.compile(
    r"\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+(20\d{2})\b",
    re.IGNORECASE,
)
_MONTH_TO_QUARTER = {
    "january": 1,
    "february": 1,
    "march": 1,
    "april": 2,
    "may": 2,
    "june": 2,
    "july": 3,
    "august": 3,
    "september": 3,
    "october": 4,
    "november": 4,
    "december": 4,
}
_SNAPSHOT_MARKERS = ("selected companies",
                     "internal monitoring document", "snapshot")
_COMPANY_HEADER_EXCLUSIONS = (
    "internal monitoring document",
    "selected companies",
    "not for distribution",
)
_NUMBERED_NOTE_RE = re.compile(r"^\(\d+\)\s")
_COMPANY_ALIASES = {
    normalize_label_text("NovaCloud Analytics Inc."): "NovaCloud",
    normalize_label_text("NovaCloud"): "NovaCloud",
    normalize_label_text("LendBridge Capital Corp."): "LendBridge",
    normalize_label_text("LendBridge"): "LendBridge",
    normalize_label_text("MediSight Data Platform Inc."): "MediSight",
    normalize_label_text("MediSight"): "MediSight",
    normalize_label_text("TalentVault Inc."): "TalentVault",
    normalize_label_text("TalentVault"): "TalentVault",
    normalize_label_text("CarbonTrack Analytics Corp."): "CarbonTrack",
    normalize_label_text("CarbonTrack"): "CarbonTrack",
}


@dataclass(slots=True)
class DetectionResult:
    """Context and candidates produced by Phase 3 detection."""

    document_type: DocumentKind
    period: str | None
    companies: list[str]
    candidates: list[MetricCandidate]


def detect_metric_candidates(parser_output: ParserOutput) -> DetectionResult:
    """Detect candidate metric/value pairs from Phase 2 parser output."""

    document_type = classify_document(parser_output)
    period = infer_period(parser_output.combined_text())
    current_company = infer_default_company(parser_output, document_type)
    companies = [current_company] if current_company else []
    candidates: list[MetricCandidate] = []
    seen_keys: set[tuple[str | None, int | None,
                         str | None, str, str, str]] = set()

    for page in parser_output.pages:
        raw_lines = page.text.splitlines()
        for index, raw_line in enumerate(raw_lines):
            line_for_table = _preserve_line(raw_line)
            line = _clean_line(raw_line)
            if not line:
                continue

            if _is_numbered_note_line(line):
                continue

            company_header = _extract_company_header(
                line, document_type=document_type)
            if company_header:
                current_company = company_header
                if company_header not in companies:
                    companies.append(company_header)
                continue

            if current_company is None and document_type == "portfolio_summary":
                continue

            split_row = _split_label_and_value(line_for_table)
            if split_row is not None:
                raw_label, raw_value = split_row
                alias = find_alias_for_label(raw_label)
                if alias is not None:
                    candidate = MetricCandidate(
                        source_file=parser_output.file_name,
                        source_page=page.page_number,
                        company_name=current_company,
                        period=period,
                        canonical_metric=alias.canonical_metric,
                        raw_label=raw_label,
                        raw_value_text=raw_value,
                        matched_alias=alias.label,
                        source_snippet=_clip_snippet(
                            _clean_line(line_for_table)),
                        detection_method="table_row",
                        label_confidence=round(
                            min(0.995, alias.confidence + 0.01), 4),
                    )
                    key = _candidate_key(candidate)
                    if key not in seen_keys:
                        seen_keys.add(key)
                        candidates.append(candidate)
                continue

            window = _build_narrative_window(
                raw_lines, index, document_type=document_type)
            if not window:
                continue

            occupied_spans: list[tuple[int, int]] = []
            for alias in NARRATIVE_ALIASES:
                pattern = re.compile(
                    rf"(?<![A-Za-z0-9]){re.escape(alias.label)}(?![A-Za-z0-9])",
                    re.IGNORECASE,
                )
                for match in pattern.finditer(window):
                    if _overlaps(match.span(), occupied_spans):
                        continue

                    tail = window[match.end(): match.end() + 120]
                    raw_value = find_value_token(tail, alias.unit)
                    if raw_value is None:
                        continue

                    occupied_spans.append(match.span())
                    snippet_end = match.end() + tail.find(raw_value) + len(raw_value)
                    candidate = MetricCandidate(
                        source_file=parser_output.file_name,
                        source_page=page.page_number,
                        company_name=current_company,
                        period=period,
                        canonical_metric=alias.canonical_metric,
                        raw_label=alias.label,
                        raw_value_text=raw_value,
                        matched_alias=alias.label,
                        source_snippet=_clip_snippet(
                            window, match.start(), snippet_end),
                        detection_method="narrative",
                        label_confidence=round(alias.confidence * 0.93, 4),
                    )
                    key = _candidate_key(candidate)
                    if key not in seen_keys:
                        seen_keys.add(key)
                        candidates.append(candidate)

    return DetectionResult(
        document_type=document_type,
        period=period,
        companies=companies,
        candidates=sorted(
            candidates,
            key=lambda candidate: (
                candidate.company_name or "",
                candidate.source_page or 0,
                candidate.detection_method,
                candidate.raw_label,
            ),
        ),
    )


def classify_document(parser_output: ParserOutput) -> DocumentKind:
    """Classify whether a parsed document is a single-company report or a portfolio summary."""

    file_name = parser_output.file_name.lower()
    combined = parser_output.combined_text().lower()
    if "portfolio_snapshot" in file_name or any(marker in combined for marker in _SNAPSHOT_MARKERS):
        return "portfolio_summary"
    return "company_report"


def infer_period(text: str) -> str | None:
    """Extract a normalized reporting period like `Q2 2025` when possible."""

    quarter_match = _QUARTER_RE.search(text)
    if quarter_match is not None:
        return quarter_match.group(1).upper()

    date_match = _DATE_RE.search(text)
    if date_match is None:
        return None

    month = date_match.group(1).lower()
    year = date_match.group(2)
    quarter = _MONTH_TO_QUARTER.get(month)
    if quarter is None:
        return None
    return f"Q{quarter} {year}"


def canonicalize_company_name(raw_name: str) -> str:
    """Normalize a company label to the short portfolio name used in outputs."""

    base = _clean_line(raw_name.split("|", 1)[0])
    normalized = normalize_label_text(base)
    if normalized in _COMPANY_ALIASES:
        return _COMPANY_ALIASES[normalized]

    first_token = re.split(r"\s+", base)[0]
    return first_token.strip(".,()")


def infer_default_company(parser_output: ParserOutput, document_type: DocumentKind) -> str | None:
    """Infer the company name for standalone reports when no in-page section headers exist."""

    if document_type == "portfolio_summary":
        return None

    stem = Path(parser_output.file_name).stem
    file_match = re.match(
        r"(?P<company>[A-Za-z0-9]+?)(?:_Q[1-4]_20\d{2})?$", stem)
    if file_match is not None:
        return canonicalize_company_name(file_match.group("company"))

    for line in parser_output.combined_text().splitlines():
        cleaned = _clean_line(line)
        if not cleaned or cleaned.lower().startswith("period"):
            continue
        return canonicalize_company_name(cleaned)
    return None


def _preserve_line(raw_line: str) -> str:
    return raw_line.replace("\u007f", " ").replace("\t", "    ").rstrip()


def _clean_line(raw_line: str) -> str:
    cleaned = _preserve_line(raw_line).strip()
    cleaned = re.sub(r"^\s*#+\s*", "", cleaned)
    cleaned = re.sub(r"^\s*[*•]+\s*", "", cleaned)
    return re.sub(r"\s+", " ", cleaned).strip()


def _extract_company_header(line: str, *, document_type: DocumentKind) -> str | None:
    if document_type != "portfolio_summary" or "|" not in line:
        return None

    left_side = _clean_line(line.split("|", 1)[0])
    lowered = left_side.lower()
    if not left_side or any(marker in lowered for marker in _COMPANY_HEADER_EXCLUSIONS):
        return None
    if lowered in {"metric", "item", "stage"}:
        return None
    return canonicalize_company_name(left_side)


def _split_label_and_value(raw_line: str) -> tuple[str, str] | None:
    stripped = raw_line.strip()
    if not stripped:
        return None

    if stripped.startswith("|") and stripped.count("|") >= 3:
        cells = [_clean_line(cell) for cell in stripped.strip("|").split("|")]
        cells = [cell for cell in cells if cell]
        if len(cells) >= 2 and _is_terminal_value(cells[-1]):
            return cells[0], cells[-1]

    columns = [_clean_line(column) for column in re.split(
        r"\s{2,}", stripped) if _clean_line(column)]
    if len(columns) < 2:
        return None

    label = columns[0]
    value = columns[-1]
    if not _is_terminal_value(value):
        return None
    return label, value


def _is_terminal_value(raw_value: str) -> bool:
    return parse_value_text(raw_value).error is None


def _build_narrative_window(
    raw_lines: list[str],
    index: int,
    *,
    document_type: DocumentKind,
) -> str:
    parts = [_clean_line(raw_lines[index])]
    if index + 1 < len(raw_lines):
        next_line = _clean_line(raw_lines[index + 1])
        if (
            next_line
            and not _is_numbered_note_line(next_line)
            and _extract_company_header(next_line, document_type=document_type) is None
        ):
            parts.append(next_line)
    return " ".join(part for part in parts if part)


def _clip_snippet(text: str, start: int = 0, end: int | None = None, limit: int = 220) -> str:
    snippet_end = len(text) if end is None else min(len(text), end + 30)
    snippet_start = max(0, start - 30)
    snippet = text[snippet_start:snippet_end].strip()
    if len(snippet) <= limit:
        return snippet
    return snippet[: limit - 3].rstrip() + "..."


def _candidate_key(candidate: MetricCandidate) -> tuple[str | None, int | None, str | None, str, str, str]:
    return (
        candidate.company_name,
        candidate.source_page,
        candidate.canonical_metric,
        candidate.raw_label,
        candidate.raw_value_text,
        candidate.detection_method,
    )


def _overlaps(span: tuple[int, int], occupied_spans: list[tuple[int, int]]) -> bool:
    for occupied_start, occupied_end in occupied_spans:
        if span[0] < occupied_end and span[1] > occupied_start:
            return True
    return False


def _is_numbered_note_line(line: str) -> bool:
    return bool(_NUMBERED_NOTE_RE.match(line))
