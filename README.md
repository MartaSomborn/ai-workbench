# ai-workbench

[![CI](https://github.com/MartaSomborn/ai-workbench/actions/workflows/ci.yml/badge.svg)](https://github.com/MartaSomborn/ai-workbench/actions/workflows/ci.yml)

AI-assisted data analysis workbench that combines deterministic CSV profiling with structured AI insights, evidence validation, anomaly detection, and report automation.

## Feature Summary

- Upload CSV and get profiling (`rows`, `columns`, missing values, numeric columns)
- Explore chart-ready data (line, bar, scatter)
- Detect anomalies using `IsolationForest`
- Ask natural-language questions about dataset context
- Validate AI findings as `supported`, `partial`, or `unsupported`
- Generate downloadable markdown reports
- Run complete analysis from CLI (`python -m ai_workbench analyze ...`)
- Enforce quality via GitHub Actions CI

## Architecture

### Stack

- **Frontend:** React, TypeScript, Vite, Recharts
- **Backend:** Python, FastAPI, Pandas, NumPy, scikit-learn
- **AI Providers:** Mock (default), Ollama (optional local)
- **Quality:** pytest, Ruff, ESLint, GitHub Actions

### Core Flow

```text
CSV Input
	-> Validation
	-> Profiling + Anomaly Detection
	-> Context Extraction
	-> AI Provider
	-> Structured Response + Evidence Validation
	-> API/UI + Markdown Report
```

For details, see:

- `docs/architecture.md`
- `docs/data-pipeline.md`
- `docs/evidence-validation.md`

## Setup

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs:

- `http://127.0.0.1:8000/docs`

### 2) Frontend

```bash
cd frontend
npm ci
npm run dev
```

UI:

- `http://localhost:5173`

## CLI Automation

From `backend`, run full analysis and report generation:

```bash
cd backend
python -m ai_workbench analyze ../data/sample_energy.csv
```

With optional controls:

```bash
cd backend
python -m ai_workbench analyze ../data/sample_energy.csv \
	--question "What are the key risks in this dataset?" \
	--output-dir app/reports/generated
```

## Testing

### Backend

```bash
cd backend
source .venv/bin/activate
python -m ruff check backend/ai_workbench backend/tests/test_cli.py
python -m pytest
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Evaluation

Current evaluation direction focuses on:

- unsupported claim rate
- evidence coverage
- response latency
- fallback frequency
- structured response validity

See `docs/llm-evaluation.md` for planned methodology.

## Engineering Notes

- Design decisions: `docs/engineering-decisions.md`
- AI-assisted delivery notes: `docs/ai-development.md`

## Demo Media

Add these before release:

- short GIF/video of upload -> analysis -> report flow
- screenshot of findings with validation badges
- screenshot of GitHub Actions CI run

## License

MIT (see `LICENSE`).
