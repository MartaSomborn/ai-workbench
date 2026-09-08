from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from app.ai import MockProvider, get_ai_provider
from app.analysis.profiler import profile_dataframe
from app.analysis.question_answering import build_analysis_context
from app.models.ask_response import AskDatasetResponse, StructuredAnalysis

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


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/datasets/profile")
async def profile_dataset(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    return profile_dataframe(df)


@app.post("/datasets/ask", response_model=AskDatasetResponse)
async def ask_dataset(question: str = Form(...), file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
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
    return AskDatasetResponse(**response_payload)
