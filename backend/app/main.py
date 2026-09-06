import io

import pandas as pd
from fastapi import FastAPI, File, UploadFile

from app.analysis.profiler import profile_dataframe


app = FastAPI(
    title="AI Workbench",
    description="AI-assisted data analysis platform",
    version="0.1.0",
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/datasets/profile")
async def profile_dataset(file: UploadFile = File(...)):
    contents = await file.read()

    df = pd.read_csv(io.BytesIO(contents))

    return profile_dataframe(df)
