from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from app.analysis.profiler import profile_dataframe

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
