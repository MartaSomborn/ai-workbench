from __future__ import annotations

from datetime import UTC, datetime
from pathlib import Path
import re

from app.models.ask_response import FindingValidation, StructuredAnalysis


def _safe_slug(value: str) -> str:
    lowered = value.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", lowered).strip("-")
    return slug or "dataset"


def _build_findings_section(
    findings: list[str],
    validation: list[FindingValidation] | list[dict],
) -> list[str]:
    if not findings:
        return ["- No findings returned."]

    lines: list[str] = []
    for index, finding in enumerate(findings):
        lines.append(f"{index + 1}. {finding}")
        if index >= len(validation):
            continue
        item = validation[index]
        if isinstance(item, dict):
            matched_metrics = item.get("matched_metrics", [])
            status = item.get("status", "unknown")
            rationale = item.get("rationale", "")
        else:
            matched_metrics = item.matched_metrics
            status = item.status
            rationale = item.rationale

        metrics = ", ".join(matched_metrics) if matched_metrics else "none"
        lines.append(f"   - Validation: {status}")
        lines.append(f"   - Matched metrics: {metrics}")
        lines.append(f"   - Rationale: {rationale}")
    return lines


def _build_simple_bullets(title: str, bullets: list[str], empty_message: str) -> list[str]:
    section = ["", title, ""]
    if bullets:
        section.extend([f"- {item}" for item in bullets])
    else:
        section.append(f"- {empty_message}")
    return section


def _build_evidence_bullets(analysis: StructuredAnalysis) -> list[str]:
    if not analysis.evidence:
        return ["- No evidence returned."]
    return [f"- {item.metric}: {item.value}" for item in analysis.evidence]


def render_markdown_report(
    *,
    dataset_name: str,
    question: str,
    provider: str,
    profile: dict,
    analysis: StructuredAnalysis,
    validation: list[FindingValidation],
    warning: str | None = None,
) -> str:
    timestamp = datetime.now(UTC).strftime("%Y-%m-%d %H:%M UTC")

    total_missing = sum(profile.get("missing_values", {}).values())
    anomalies = profile.get("anomalies", {})

    lines: list[str] = [
        f"# AI Workbench Report — {dataset_name}",
        "",
        f"- Generated: {timestamp}",
        f"- Provider: {provider}",
        f"- Question: {question}",
    ]

    if warning:
        lines.extend(["", f"> ⚠️ {warning}"])

    lines.extend(
        [
            "",
            "## Dataset Overview",
            "",
            f"- Rows: {profile.get('rows', 0)}",
            f"- Columns: {profile.get('columns', 0)}",
            f"- Numeric Columns: {len(profile.get('numeric_columns', []))}",
            f"- Missing Values: {total_missing}",
            f"- Anomalies: {anomalies.get('count', 0)} ({float(anomalies.get('rate', 0.0)) * 100:.2f}%)",
            "",
            "## Summary",
            "",
            analysis.summary or "No summary provided.",
            "",
            "## Findings",
            "",
        ]
    )
    lines.extend(_build_findings_section(analysis.findings, validation))
    lines.extend(
        _build_simple_bullets(
            "## Recommendations",
            analysis.recommendations,
            "No recommendations returned.",
        )
    )
    lines.extend(["", "## Evidence", ""])
    lines.extend(_build_evidence_bullets(analysis))

    return "\n".join(lines).strip() + "\n"


def save_markdown_report(
    *,
    content: str,
    dataset_name: str,
    output_dir: str | Path,
) -> tuple[str, str]:
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    slug = _safe_slug(Path(dataset_name).stem)
    report_id = f"{slug}-{datetime.now(UTC).strftime('%Y%m%d-%H%M%S')}"
    file_path = output_path / f"{report_id}.md"
    file_path.write_text(content, encoding="utf-8")

    return report_id, str(file_path)