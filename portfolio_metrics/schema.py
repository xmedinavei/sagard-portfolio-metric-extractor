from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


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
