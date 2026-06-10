from __future__ import annotations

import pytest

from portfolio_metrics.parse_values import parse_value_text


@pytest.mark.parametrize(
    ("raw_text", "unit_hint", "expected_value", "expected_unit"),
    [
        ("$34.2M", "usd", 34_200_000.0, "usd"),
        ("78%", "percentage", 78.0, "percentage"),
        ("($0.75M)", "usd", -750_000.0, "usd"),
        ("2.4x", "multiplier", 2.4, "multiplier"),
        ("1,042", "count", 1042.0, "count"),
        ("+148bps", "basis_points", 148.0, "basis_points"),
        ("27.9M", "usd", 27_900_000.0, "usd"),
    ],
)
def test_parse_supported_value_formats(
    raw_text: str,
    unit_hint: str,
    expected_value: float,
    expected_unit: str,
) -> None:
    result = parse_value_text(raw_text, unit_hint=unit_hint)

    assert result.error is None
    assert result.unit == expected_unit
    assert result.value == pytest.approx(expected_value)


@pytest.mark.parametrize("raw_text", ["~$5M", "TBD", "", "approx. $4.0M"])
def test_parse_value_text_rejects_ambiguous_inputs(raw_text: str) -> None:
    result = parse_value_text(raw_text, unit_hint="usd")

    assert result.value is None
    assert result.error is not None
