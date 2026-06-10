from __future__ import annotations

from pathlib import Path
from typing import Protocol

from .schema import ParserOutput


class PdfParserError(RuntimeError):
    """Raised when a parser cannot produce usable text for a PDF."""


class PdfParser(Protocol):
    """Small protocol that keeps downstream code parser-agnostic."""

    parser_name: str

    def parse(self, pdf_path: Path) -> ParserOutput:
        """Parse a PDF file into the stable `ParserOutput` contract."""
