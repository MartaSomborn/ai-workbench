# Architecture

## Overview

`ai-workbench` is a full-stack data analysis application with three interaction layers:

1. **API layer** (`FastAPI`) for upload, profiling, Q&A, and report generation
2. **Web UI layer** (`React + TypeScript`) for interactive analysis and visualization
3. **CLI layer** (`python -m ai_workbench`) for one-command automation

All layers reuse shared backend analysis modules to avoid duplicated logic.

## High-Level Flow

```text
CSV Input
   |
   v
Validation (read_validated_csv)
   |
   +--> Profiling (rows, columns, stats, charts, anomalies)
   |
   +--> Context Builder (evidence + correlations)
           |
           v
      AI Provider (mock / ollama, with fallback)
           |
           v
   Structured Analysis + Evidence Validation
           |
           +--> API JSON response
           +--> Markdown report output
```

## Backend Structure

- `app/main.py`: FastAPI routes (`/health`, `/datasets/profile`, `/datasets/ask`, `/datasets/report`)
- `app/analysis/validation.py`: robust CSV checks and user-facing errors
- `app/analysis/profiler.py`: dataset summary + chart payload + anomaly metadata
- `app/analysis/anomaly.py`: `IsolationForest`-based outlier detection
- `app/analysis/question_answering.py`: deterministic context extraction for providers
- `app/analysis/evidence_validation.py`: `supported` / `partial` / `unsupported` classification
- `app/ai/client.py`: provider abstraction and fallback handling
- `app/reports/markdown_report.py`: report rendering + file writing
- `app/models/*.py`: strict response contracts (`Pydantic`)

## Frontend Structure

- `frontend/src/App.tsx`: upload flow, profile dashboard, charts, ask-dataset flow, report generation UI
- `frontend/src/App.css`: dashboard, badges, chart, and report preview styling

## Quality Gates

- Backend tests: `pytest`
- Backend lint: `ruff`
- Frontend lint: `eslint`
- Frontend build: `vite build`
- CI: GitHub Actions workflows in `.github/workflows/`

## Design Principles

- **Single source of logic**: API and CLI use shared analysis modules
- **Fail-fast validation**: reject invalid CSV before expensive processing
- **Structured AI outputs**: normalize provider output into strict schema
- **Evidence-first trust**: findings are explicitly validated against extracted metrics
- **Graceful degradation**: provider fallback keeps system usable when local model fails
