from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.ai import MockProvider, get_ai_provider
from app.analysis.profiler import profile_dataframe
from app.analysis.evidence_validation import validate_findings_against_evidence
from app.analysis.question_answering import build_analysis_context
from app.analysis.validation import CSVValidationError, read_validated_csv
from app.models.ask_response import AskDatasetResponse, StructuredAnalysis
from app.models.report_response import ReportResponse
from app.reports.markdown_report import render_markdown_report, save_markdown_report

app = FastAPI(
    title="AI Workbench",
    description="AI-assisted data analysis platform",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_REPORT_QUESTION = (
    "Provide a concise summary, key findings, and practical recommendations "
    "for this dataset."
)


def _resolve_report_output_dir() -> Path:
    return Path(__file__).resolve().parent / "reports" / "generated"


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post(
    "/datasets/profile",
    responses={400: {"description": "Invalid CSV input."}},
)
async def profile_dataset(file: UploadFile = File(...)):
    try:
        df = read_validated_csv(file.file)
    except CSVValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return profile_dataframe(df)


@app.post(
    "/datasets/ask",
    response_model=AskDatasetResponse,
    responses={400: {"description": "Invalid CSV input."}},
)
async def ask_dataset(question: str = Form(...), file: UploadFile = File(...)):
    try:
        df = read_validated_csv(file.file)
    except CSVValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    context = build_analysis_context(df)

    provider = get_ai_provider()
    response_payload = {
        "provider": provider.name,
        "question": question,
    }

    try:
        raw_analysis = provider.analyze(question=question, context=context)
    except RuntimeError as exc:
        fallback_provider = MockProvider()
        raw_analysis = fallback_provider.analyze(question=question, context=context)
        response_payload["provider"] = fallback_provider.name
        response_payload["requested_provider"] = provider.name
        response_payload["warning"] = str(exc)

    response_payload["analysis"] = StructuredAnalysis.from_provider_output(
        raw_analysis=raw_analysis,
        fallback_evidence=context.get("evidence", []),
    )

    response_payload["validation"] = validate_findings_against_evidence(
        findings=response_payload["analysis"].findings,
        evidence_metrics=[item.metric for item in response_payload["analysis"].evidence],
    )

    return AskDatasetResponse(**response_payload)


@app.post(
    "/datasets/report",
    response_model=ReportResponse,
    responses={400: {"description": "Invalid CSV input."}},
)
async def generate_report(
    file: UploadFile = File(...),
    question: str = Form(DEFAULT_REPORT_QUESTION),
):
    try:
        df = read_validated_csv(file.file)
    except CSVValidationError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    profile = profile_dataframe(df)
    context = build_analysis_context(df)

    provider = get_ai_provider()
    provider_name = provider.name
    requested_provider: str | None = None
    warning: str | None = None

    try:
        raw_analysis = provider.analyze(question=question, context=context)
    except RuntimeError as exc:
        fallback_provider = MockProvider()
        raw_analysis = fallback_provider.analyze(question=question, context=context)
        requested_provider = provider.name
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
        dataset_name=file.filename or "dataset.csv",
        question=question,
        provider=provider_name,
        profile=profile,
        analysis=analysis,
        validation=validation,
        warning=warning,
    )

    report_id, report_path = save_markdown_report(
        content=markdown,
        dataset_name=file.filename or "dataset.csv",
        output_dir=_resolve_report_output_dir(),
    )

    return ReportResponse(
        report_id=report_id,
        report_path=report_path,
        markdown=markdown,
        provider=provider_name,
        question=question,
        requested_provider=requested_provider,
        warning=warning,
    )
