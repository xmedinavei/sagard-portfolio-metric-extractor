from __future__ import annotations

from pathlib import Path
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[1]
_PLACEHOLDER_SNIPPETS = (
    "your-openai-key",
    "your-firecrawl-key",
    "https://your-resource",
    "your-azure-document-intelligence-key",
)


def _is_populated(value: str | None) -> bool:
    return bool(value and value.strip() and not any(token in value for token in _PLACEHOLDER_SNIPPETS))


class Settings(BaseSettings):
    """Environment-backed configuration for the bootstrap CLI."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    openai_api_key: str | None = None
    firecrawl_api_key: str | None = None
    pdf_parser: Literal["firecrawl", "local"] = "firecrawl"
    openai_model: str = "gpt-5.4-mini"
    azure_document_intelligence_endpoint: str | None = None
    azure_document_intelligence_key: str | None = None
    azure_document_intelligence_model: str = "prebuilt-layout"

    @property
    def project_root(self) -> Path:
        return PROJECT_ROOT

    @property
    def openai_configured(self) -> bool:
        return _is_populated(self.openai_api_key)

    @property
    def firecrawl_configured(self) -> bool:
        return _is_populated(self.firecrawl_api_key)

    @property
    def azure_document_intelligence_configured(self) -> bool:
        return _is_populated(self.azure_document_intelligence_endpoint) and _is_populated(
            self.azure_document_intelligence_key
        )
