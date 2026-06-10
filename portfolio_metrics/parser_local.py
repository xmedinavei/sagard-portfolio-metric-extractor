from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader

from .parser import PdfParserError
from .schema import ExtractedPage, ParserOutput, ProvenanceStrategy


class LocalPdfParser:
    """Local page-aware parser used as the offline and fallback implementation."""

    parser_name = "local"

    def parse(self, pdf_path: Path) -> ParserOutput:
        try:
            reader = PdfReader(str(pdf_path))
        except Exception as exc:  # pragma: no cover - defensive branch
            raise PdfParserError(
                f"Local parser could not open {pdf_path.name}: {exc}") from exc

        pages: list[ExtractedPage] = []
        empty_pages: list[str] = []
        for page_number, page in enumerate(reader.pages, start=1):
            try:
                text = self._extract_page_text(page)
            except Exception as exc:  # pragma: no cover - defensive branch
                raise PdfParserError(
                    f"Local parser could not extract page {page_number} from {pdf_path.name}: {exc}"
                ) from exc
            if not text:
                empty_pages.append(str(page_number))
            pages.append(ExtractedPage.from_text(
                text, page_number=page_number))

        if not pages:
            raise PdfParserError(
                f"Local parser found no pages in {pdf_path.name}.")

        if all(not page.text for page in pages):
            raise PdfParserError(
                f"Local parser could not extract readable text from {pdf_path.name}; the document may require OCR."
            )

        notes: list[str] = []
        if empty_pages:
            notes.append(
                "Local parser returned empty text for page(s): " + ", ".join(
                    empty_pages) + "."
            )

        return ParserOutput(
            file_name=pdf_path.name,
            source_path=str(pdf_path.resolve()),
            requested_parser="local",
            parser_used="local",
            raw_format="text",
            page_count=len(pages),
            pages=pages,
            provenance=ProvenanceStrategy(
                file_level=True,
                page_level=True,
                snippet_level=False,
                description=(
                    "File-level provenance plus explicit page numbers from local PDF text extraction."
                ),
            ),
            notes=notes,
        )

    @staticmethod
    def _extract_page_text(page: object) -> str:
        try:
            # type: ignore[call-arg]
            text = page.extract_text(extraction_mode="layout")
        except TypeError:
            text = page.extract_text()
        except Exception:
            text = page.extract_text()
        return (text or "").strip()
