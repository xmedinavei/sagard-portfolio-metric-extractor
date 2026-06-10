from __future__ import annotations

import os
import sys
from typing import Any

_RESET = "\033[0m"
_STYLE_CODES = {
    "bold": "\033[1m",
    "dim": "\033[2m",
    "red": "\033[31m",
    "green": "\033[32m",
    "yellow": "\033[33m",
    "blue": "\033[34m",
    "magenta": "\033[35m",
    "cyan": "\033[36m",
}


def supports_color(stream: Any | None = None) -> bool:
    """Return whether ANSI colors should be emitted for text-mode CLI output."""

    if os.getenv("NO_COLOR") is not None:
        return False

    force_color = os.getenv("FORCE_COLOR")
    if force_color not in (None, "", "0"):
        return True

    target_stream = sys.stdout if stream is None else stream
    isatty = getattr(target_stream, "isatty", None)
    if not callable(isatty) or not isatty():
        return False

    return os.getenv("TERM", "").lower() not in {"", "dumb"}


def paint(text: str, *styles: str, stream: Any | None = None) -> str:
    """Apply ANSI styles when supported; otherwise return the text unchanged."""

    if not styles or not supports_color(stream=stream):
        return text

    prefix = "".join(_STYLE_CODES[style] for style in styles)
    return f"{prefix}{text}{_RESET}"


def phase_status_line(phase_name: str, *, ready: bool, stream: Any | None = None) -> str:
    icon = "✔" if ready else "⚠"
    status = "ready" if ready else "needs attention"
    tone = "green" if ready else "yellow"
    return paint(f"{icon} {phase_name}: {status}", "bold", tone, stream=stream)


def section_heading(title: str, *, tone: str = "cyan", stream: Any | None = None) -> str:
    return paint(f"▸ {title}", "bold", tone, stream=stream)


def note_line(text: str, *, tone: str = "dim", stream: Any | None = None) -> str:
    return paint(f"ℹ {text}", tone, stream=stream)


def warning_line(text: str, *, stream: Any | None = None) -> str:
    return paint(f"  ⚠ {text}", "yellow", stream=stream)


def failure_line(text: str, *, stream: Any | None = None) -> str:
    return paint(f"  ✖ {text}", "red", stream=stream)
