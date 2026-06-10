from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import requests

from .parser import PdfParserError
from .schema import ExtractedPage, ParserOutput, ProvenanceStrategy


class FirecrawlPdfParser:
    """Firecrawl-backed parser for fast document-to-markdown extraction."""

    parser_name = "firecrawl"
    api_url = "https://api.firecrawl.dev/v2/parse"

    def __init__(self, api_key: str, mode: str = "auto", timeout_seconds: int = 60) -> None:
        if not api_key.strip():
            raise PdfParserError(
                "FIRECRAWL_API_KEY is required when using the Firecrawl parser.")
        self.api_key = api_key
        self.mode = mode
        self.timeout_seconds = timeout_seconds

    def parse(self, pdf_path: Path) -> ParserOutput:
        options = {
            "formats": ["markdown"],
            "parsers": [{"type": "pdf", "mode": self.mode}],
        }

        try:
            with pdf_path.open("rb") as handle:
                response = requests.post(
                    self.api_url,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    files={"file": (pdf_path.name, handle, "application/pdf")},
                    data={"options": json.dumps(options)},
                    timeout=self.timeout_seconds,
                )
        except requests.RequestException as exc:
            raise PdfParserError(
                f"Firecrawl request failed for {pdf_path.name}: {exc}") from exc

        payload = self._decode_response(response, pdf_path.name)
        data = payload.get("data") if isinstance(
            payload.get("data"), dict) else payload
        markdown = str(data.get("markdown") or "").strip()
        metadata = data.get("metadata") if isinstance(
            data.get("metadata"), dict) else {}

        if not markdown:
            raise PdfParserError(
                f"Firecrawl returned empty markdown for {pdf_path.name}.")

        page_count = metadata.get("numPages")
        if not isinstance(page_count, int):
            try:
                page_count = int(page_count)
            except (TypeError, ValueError):
                page_count = 1

        return ParserOutput(
            file_name=pdf_path.name,
            source_path=str(pdf_path.resolve()),
            requested_parser="firecrawl",
            parser_used="firecrawl",
            raw_format="markdown",
            page_count=page_count,
            pages=[ExtractedPage.from_text(markdown)],
            provenance=ProvenanceStrategy(
                file_level=True,
                page_level=False,
                snippet_level=False,
                description=(
                    "File-level provenance is guaranteed in v1; Firecrawl page count metadata is retained "
                    "when available, but the extracted content is document-level markdown."
                ),
            ),
            notes=[f"Firecrawl PDF mode: {self.mode}."],
        )

    def _decode_response(self, response: requests.Response, file_name: str) -> dict[str, Any]:
        try:
            payload = response.json()
        except ValueError as exc:
            raise PdfParserError(
                f"Firecrawl returned a non-JSON response for {file_name}: {response.text.strip()}"
            ) from exc

        if response.status_code >= 400:
            error_message = payload.get("error") or payload.get(
                "message") or response.reason
            raise PdfParserError(
                f"Firecrawl returned HTTP {response.status_code} for {file_name}: {error_message}"
            )

        if payload.get("success") is False:
            error_message = payload.get("error") or payload.get(
                "message") or "unknown error"
            raise PdfParserError(
                f"Firecrawl reported a parse failure for {file_name}: {error_message}")

        return payload
