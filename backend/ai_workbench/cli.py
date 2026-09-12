from __future__ import annotations

import argparse
import sys
from pathlib import Path

from app.ai import MockProvider, get_ai_provider
from app.analysis.evidence_validation import validate_findings_against_evidence
from app.analysis.profiler import profile_dataframe
from app.analysis.question_answering import build_analysis_context
from app.analysis.validation import CSVValidationError, read_validated_csv
from app.models.ask_response import StructuredAnalysis
from app.reports.markdown_report import render_markdown_report, save_markdown_report

DEFAULT_REPORT_QUESTION = (
    "Provide a concise summary, key findings, and practical recommendations "
    "for this dataset."
)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="ai_workbench",
        description="AI Workbench CLI",
    )

    subparsers = parser.add_subparsers(dest="command")

    analyze_parser = subparsers.add_parser(
        "analyze",
        help="Analyze a CSV and generate a markdown report.",
    )
    analyze_parser.add_argument("csv_path", help="Path to input CSV file.")
    analyze_parser.add_argument(
        "--question",
        default=DEFAULT_REPORT_QUESTION,
        help="Question to drive the analysis output.",
    )
    analyze_parser.add_argument(
        "--output-dir",
        default="app/reports/generated",
        help="Directory where markdown report will be saved.",
    )

    return parser


def _run_analyze(csv_path: str, question: str, output_dir: str) -> int:
    path = Path(csv_path)

    if not path.exists() or not path.is_file():
        print(f"Error: file not found: {path}", file=sys.stderr)
        return 1

    try:
        with path.open("rb") as file_obj:
            dataframe = read_validated_csv(file_obj)
    except CSVValidationError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    profile = profile_dataframe(dataframe)
    context = build_analysis_context(dataframe)

    provider = get_ai_provider()
    provider_name = provider.name
    warning: str | None = None

    try:
        raw_analysis = provider.analyze(question=question, context=context)
    except RuntimeError as exc:
        fallback_provider = MockProvider()
        raw_analysis = fallback_provider.analyze(question=question, context=context)
        provider_name = fallback_provider.name
        warning = str(exc)

    analysis = StructuredAnalysis.from_provider_output(
        raw_analysis=raw_analysis,
        fallback_evidence=context.get("evidence", []),
    )

    validation = validate_findings_against_evidence(
        findings=analysis.findings,
        evidence_metrics=[item.metric for item in analysis.evidence],
    )

    markdown = render_markdown_report(
        dataset_name=path.name,
        question=question,
        provider=provider_name,
        profile=profile,
        analysis=analysis,
        validation=validation,
        warning=warning,
    )

    report_id, report_path = save_markdown_report(
        content=markdown,
        dataset_name=path.name,
        output_dir=output_dir,
    )

    print("Analysis complete")
    print(f"Rows: {profile['rows']}")
    print(f"Columns: {profile['columns']}")
    print(f"Anomalies: {profile['anomalies']['count']}")
    print(f"Provider: {provider_name}")
    print(f"Report ID: {report_id}")
    print(f"Report Path: {report_path}")

    if warning:
        print(f"Warning: {warning}")

    return 0


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)

    if args.command == "analyze":
        return _run_analyze(
            csv_path=args.csv_path,
            question=args.question,
            output_dir=args.output_dir,
        )

    parser.print_help()
    return 1
