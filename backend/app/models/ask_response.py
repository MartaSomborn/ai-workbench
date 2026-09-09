from __future__ import annotations

from typing import Any
from typing import Literal

from pydantic import BaseModel, Field


class EvidenceItem(BaseModel):
    metric: str
    value: str | int | float | bool | None = None


class StructuredAnalysis(BaseModel):
    summary: str
    findings: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    evidence: list[EvidenceItem] = Field(default_factory=list)

    @classmethod
    def from_provider_output(
        cls,
        raw_analysis: dict[str, Any],
        fallback_evidence: list[dict[str, Any]],
    ) -> "StructuredAnalysis":
        summary = str(raw_analysis.get("summary", ""))

        findings_raw = raw_analysis.get("findings", [])
        if not isinstance(findings_raw, list):
            findings_raw = []

        recommendations_raw = raw_analysis.get("recommendations", [])
        if not isinstance(recommendations_raw, list):
            recommendations_raw = []

        evidence_raw = raw_analysis.get("evidence", fallback_evidence)
        if not isinstance(evidence_raw, list):
            evidence_raw = fallback_evidence

        normalized_evidence: list[dict[str, Any]] = []
        for item in evidence_raw:
            if not isinstance(item, dict):
                continue
            metric = item.get("metric")
            if metric is None:
                continue
            normalized_evidence.append(
                {
                    "metric": str(metric),
                    "value": item.get("value"),
                }
            )

        return cls(
            summary=summary,
            findings=[str(item) for item in findings_raw],
            recommendations=[str(item) for item in recommendations_raw],
            evidence=[EvidenceItem(**item) for item in normalized_evidence],
        )


class FindingValidation(BaseModel):
    finding: str
    status: Literal["supported", "unsupported", "partial"]
    matched_metrics: list[str] = Field(default_factory=list)
    rationale: str


class AskDatasetResponse(BaseModel):
    provider: str
    question: str
    analysis: StructuredAnalysis
    validation: list[FindingValidation] = Field(default_factory=list)
    requested_provider: str | None = None
    warning: str | None = None
