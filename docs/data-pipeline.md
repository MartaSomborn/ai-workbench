# Data Pipeline

## Pipeline Stages

### 1) Ingestion

Input sources:

- API file upload (`UploadFile`)
- CLI file path (`python -m ai_workbench analyze ...`)

All inputs are funneled into `read_validated_csv(...)`.

### 2) Validation

Validation rules in `app/analysis/validation.py`:

- empty file
- parse/format errors
- unsupported encoding
- no columns
- no data rows
- all-null rows
- all-null columns

Validation errors are surfaced as stable user messages (HTTP 400 in API mode).

### 3) Profiling

`profile_dataframe(...)` computes:

- row/column counts
- column names + numeric columns
- missing values by column
- preview rows
- chart payloads (`line`, `bar`, `scatter`)
- anomaly summary from `detect_anomalies(...)`

### 4) Anomaly Detection

`detect_anomalies(...)`:

- selects numeric features
- fills missing values with medians
- runs `IsolationForest`
- returns:
  - anomaly count
  - anomaly rate
  - preview row flags
  - numeric columns used

### 5) AI Context Construction

`build_analysis_context(...)` produces deterministic, compact context:

- dimensions and schema
- missing-value summary
- key means
- strongest correlations
- evidence list

### 6) Provider Analysis

`get_ai_provider()` chooses provider:

- `mock` (default)
- `ollama` (optional local)

If provider fails, backend falls back to `mock` and includes warning metadata.

### 7) Output Normalization + Validation

- normalize model output to strict schema via `StructuredAnalysis.from_provider_output(...)`
- validate findings vs evidence metrics via `validate_findings_against_evidence(...)`

### 8) Output Delivery

- API response for frontend rendering
- Markdown report generation via `render_markdown_report(...)` + `save_markdown_report(...)`

## Operational Notes

- Pipeline is deterministic except model inference itself
- Core analysis logic is reusable in API and CLI modes
- Edge-case handling is tested in backend test suite
