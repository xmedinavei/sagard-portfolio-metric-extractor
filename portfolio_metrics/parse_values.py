from __future__ import annotations

import re

from .schema import MeasurementUnit, ValueParseResult

_NUMBER_PATTERN = r"\d(?:[\d,]*\d)?(?:\.\d+)?"
_APPROXIMATION_RE = re.compile(
    r"(~|\bapprox(?:\.|imately)?\b|\babout\b|\baround\b|\bcirca\b|[<>])", re.IGNORECASE)
_CURRENCY_RE = re.compile(
    rf"^\(?\s*(?P<sign>[+-])?\s*\$?\s*(?P<number>{_NUMBER_PATTERN})\s*(?P<scale>[kmbKMB])?\s*\)?$"
)
_PERCENT_RE = re.compile(
    rf"^\(?\s*(?P<sign>[+-])?\s*(?P<number>{_NUMBER_PATTERN})\s*%\s*\)?$",
    re.IGNORECASE,
)
_BPS_RE = re.compile(
    rf"^\(?\s*(?P<sign>[+-])?\s*(?P<number>{_NUMBER_PATTERN})\s*bps\s*\)?$",
    re.IGNORECASE,
)
_MULTIPLIER_RE = re.compile(
    rf"^\(?\s*(?P<sign>[+-])?\s*(?P<number>{_NUMBER_PATTERN})\s*x\s*\)?$",
    re.IGNORECASE,
)
_COUNT_RE = re.compile(
    rf"^\(?\s*(?P<sign>[+-])?\s*(?P<number>{_NUMBER_PATTERN})\s*\)?$")

_CURRENCY_TOKEN_RE = re.compile(
    rf"\(?\s*[+-]?\s*(?:\$\s*{_NUMBER_PATTERN}(?:\s*[kmbKMB])?|{_NUMBER_PATTERN}\s*[kmbKMB])\s*\)?",
    re.IGNORECASE,
)
_PERCENT_TOKEN_RE = re.compile(
    rf"\(?\s*[+-]?\s*{_NUMBER_PATTERN}\s*%\s*\)?", re.IGNORECASE)
_BPS_TOKEN_RE = re.compile(
    rf"\(?\s*[+-]?\s*{_NUMBER_PATTERN}\s*bps\s*\)?", re.IGNORECASE)
_MULTIPLIER_TOKEN_RE = re.compile(
    rf"\(?\s*[+-]?\s*{_NUMBER_PATTERN}\s*x\s*\)?", re.IGNORECASE)
_COUNT_TOKEN_RE = re.compile(rf"\(?\s*[+-]?\s*{_NUMBER_PATTERN}\s*\)?")

_SCALE_FACTORS = {"k": 1_000.0, "m": 1_000_000.0, "b": 1_000_000_000.0}
_UNIT_ORDER: dict[MeasurementUnit | None, tuple[MeasurementUnit, ...]] = {
    "usd": ("usd", "percentage", "basis_points", "multiplier", "count"),
    "percentage": ("percentage", "basis_points", "multiplier", "usd", "count"),
    "basis_points": ("basis_points", "percentage", "multiplier", "usd", "count"),
    "multiplier": ("multiplier", "percentage", "basis_points", "usd", "count"),
    "count": ("count", "usd", "percentage", "basis_points", "multiplier"),
    "unknown": ("usd", "percentage", "basis_points", "multiplier", "count"),
    None: ("usd", "percentage", "basis_points", "multiplier", "count"),
}
_SEARCH_PATTERNS: dict[MeasurementUnit, re.Pattern[str]] = {
    "usd": _CURRENCY_TOKEN_RE,
    "percentage": _PERCENT_TOKEN_RE,
    "basis_points": _BPS_TOKEN_RE,
    "multiplier": _MULTIPLIER_TOKEN_RE,
    "count": _COUNT_TOKEN_RE,
    "unknown": _COUNT_TOKEN_RE,
}


def parse_value_text(raw_text: str, unit_hint: MeasurementUnit | None = None) -> ValueParseResult:
    """Parse a numeric token deterministically without inventing missing units."""

    cleaned = _clean_value_text(raw_text)
    if not cleaned:
        return ValueParseResult(raw_text=raw_text, error="Value text is empty.")

    if _APPROXIMATION_RE.search(cleaned):
        return ValueParseResult(
            raw_text=raw_text,
            error="Approximate or threshold values are not normalized automatically.",
        )

    for unit in _UNIT_ORDER.get(unit_hint, _UNIT_ORDER[None]):
        parser = {
            "usd": _parse_currency,
            "percentage": _parse_percentage,
            "basis_points": _parse_basis_points,
            "multiplier": _parse_multiplier,
            "count": _parse_count,
        }[unit]
        result = parser(cleaned, raw_text=raw_text)
        if result is not None:
            return result

    return ValueParseResult(raw_text=raw_text, error=f"Unsupported value format: {cleaned}")


def find_value_token(text: str, unit_hint: MeasurementUnit | None = None) -> str | None:
    """Find the earliest value-like token near a matched alias."""

    haystack = " ".join(text.split())
    for unit in _UNIT_ORDER.get(unit_hint, _UNIT_ORDER[None]):
        pattern = _SEARCH_PATTERNS[unit]
        match = pattern.search(haystack)
        if match is None:
            continue
        token = _clean_value_text(match.group(0))
        if token:
            return token

    return None


def _clean_value_text(raw_text: str) -> str:
    cleaned = raw_text.replace("\u007f", " ").strip()
    cleaned = cleaned.lstrip("*•").strip()
    return cleaned.rstrip(".;,")


def _parse_currency(cleaned: str, *, raw_text: str) -> ValueParseResult | None:
    match = _CURRENCY_RE.fullmatch(cleaned)
    if match is None:
        return None

    scale = (match.group("scale") or "").lower()
    has_dollar = "$" in cleaned
    if not has_dollar and not scale:
        return None

    magnitude = _parse_number(match.group("number"))
    value = round(magnitude * _SCALE_FACTORS.get(scale, 1.0), 6)
    value = _apply_sign(value, cleaned, match.group("sign"))

    notes: list[str] = []
    confidence = 0.99 if has_dollar else 0.93
    if not has_dollar:
        notes.append("USD unit inferred from shorthand suffix.")

    return ValueParseResult(
        raw_text=raw_text,
        value=value,
        unit="usd",
        parsing_method="currency_shorthand",
        confidence=confidence,
        notes=notes,
    )


def _parse_percentage(cleaned: str, *, raw_text: str) -> ValueParseResult | None:
    match = _PERCENT_RE.fullmatch(cleaned)
    if match is None:
        return None

    value = round(_apply_sign(_parse_number(
        match.group("number")), cleaned, match.group("sign")), 6)
    return ValueParseResult(
        raw_text=raw_text,
        value=value,
        unit="percentage",
        parsing_method="percentage",
        confidence=0.99,
    )


def _parse_basis_points(cleaned: str, *, raw_text: str) -> ValueParseResult | None:
    match = _BPS_RE.fullmatch(cleaned)
    if match is None:
        return None

    value = round(_apply_sign(_parse_number(
        match.group("number")), cleaned, match.group("sign")), 6)
    return ValueParseResult(
        raw_text=raw_text,
        value=value,
        unit="basis_points",
        parsing_method="basis_points",
        confidence=0.99,
    )


def _parse_multiplier(cleaned: str, *, raw_text: str) -> ValueParseResult | None:
    match = _MULTIPLIER_RE.fullmatch(cleaned)
    if match is None:
        return None

    value = round(_apply_sign(_parse_number(
        match.group("number")), cleaned, match.group("sign")), 6)
    return ValueParseResult(
        raw_text=raw_text,
        value=value,
        unit="multiplier",
        parsing_method="multiplier",
        confidence=0.99,
    )


def _parse_count(cleaned: str, *, raw_text: str) -> ValueParseResult | None:
    match = _COUNT_RE.fullmatch(cleaned)
    if match is None:
        return None

    if "." in match.group("number"):
        return None

    value = round(_apply_sign(_parse_number(
        match.group("number")), cleaned, match.group("sign")), 6)
    return ValueParseResult(
        raw_text=raw_text,
        value=value,
        unit="count",
        parsing_method="integer_count",
        confidence=0.96,
    )


def _parse_number(raw_number: str) -> float:
    return float(raw_number.replace(",", ""))


def _apply_sign(value: float, cleaned: str, sign: str | None) -> float:
    if sign == "-" or ("(" in cleaned and ")" in cleaned):
        return -value
    return value
