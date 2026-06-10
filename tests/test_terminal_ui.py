from __future__ import annotations

from portfolio_metrics.terminal_ui import paint, phase_status_line


class _DummyStream:
    def __init__(self, *, tty: bool) -> None:
        self._tty = tty

    def isatty(self) -> bool:
        return self._tty


def test_paint_returns_plain_text_without_color_support(monkeypatch) -> None:
    monkeypatch.delenv("FORCE_COLOR", raising=False)
    monkeypatch.delenv("NO_COLOR", raising=False)
    monkeypatch.setenv("TERM", "xterm-256color")

    assert paint("hello", "green", stream=_DummyStream(tty=False)) == "hello"


def test_paint_can_force_color_even_when_stream_is_not_a_tty(monkeypatch) -> None:
    monkeypatch.setenv("FORCE_COLOR", "1")
    monkeypatch.delenv("NO_COLOR", raising=False)

    painted = paint("hello", "green", stream=_DummyStream(tty=False))

    assert painted.startswith("\033[")
    assert "hello" in painted


def test_no_color_disables_forced_color(monkeypatch) -> None:
    monkeypatch.setenv("FORCE_COLOR", "1")
    monkeypatch.setenv("NO_COLOR", "1")

    assert phase_status_line("Phase 1 preflight", ready=True, stream=_DummyStream(
        tty=True)) == "✔ Phase 1 preflight: ready"
