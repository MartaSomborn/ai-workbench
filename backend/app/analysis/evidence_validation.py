from __future__ import annotations

import re
from typing import Literal

Status = Literal["supported", "unsupported", "partial"]


def _normalize(text: str) -> str:
    return re.sub(r"[^a-z0-9_ ]+", " ", text.lower()).strip()


def _extract_keywords(text: str) -> set[str]:
    keywords: set[str] = set()
    for token in _normalize(text).split():
        if len(token) >= 4:
            keywords.add(token)
    return keywords


def validate_findings_against_evidence(
    findings: list[str],
    evidence_metrics: list[str],
) -> list[dict[str, str | list[str]]]:
    normalized_metrics = [metric.lower() for metric in evidence_metrics]
    validation: list[dict[str, str | list[str]]] = []

    for finding in findings:
        finding_text = str(finding)
        keywords = _extract_keywords(finding_text)

        matched_metrics = sorted(
            {
                metric
                for metric in normalized_metrics
                for keyword in keywords
                if keyword in metric
            }
        )

        status: Status
        rationale: str
        has_uncertainty = any(
            word in _normalize(finding_text)
            for word in ["may", "might", "possibly", "suggests", "could"]
        )

        if matched_metrics and has_uncertainty:
            status = "partial"
            rationale = "Finding has evidence matches but uses uncertain language."
        elif matched_metrics:
            status = "supported"
            rationale = "Finding matches available evidence metrics."
        else:
            status = "unsupported"
            rationale = "No matching evidence metric was found for this finding."

        validation.append(
            {
                "finding": finding_text,
                "status": status,
                "matched_metrics": matched_metrics,
                "rationale": rationale,
            }
        )

    return validation
