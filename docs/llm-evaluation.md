# LLM Evaluation Plan

## Purpose

Measure quality and reliability of AI-generated analysis responses in `ai-workbench`.

## Evaluation Scope

Evaluate at least:

- `mock` provider baseline
- `ollama` provider (when available)

## Core Metrics

1. **Unsupported claim rate**
   - Fraction of findings labeled `unsupported`
2. **Partial support rate**
   - Fraction of findings labeled `partial`
3. **Evidence coverage**
   - Average matched metrics per finding
4. **Latency**
   - Time from request start to completed response
5. **Fallback frequency**
   - Share of requests that fell back from requested provider
6. **Structured validity**
   - Percent of responses successfully normalized into required schema

## Benchmark Method

1. Define fixed dataset-question pairs
2. Run each provider on same pairs
3. Capture raw output + normalized output + validation results
4. Compare metrics per provider
5. Review representative failure cases manually

## Example Evaluation Questions

- "What factors are related to high energy consumption?"
- "Do missing values affect reliability of this analysis?"
- "Which columns most strongly correlate with energy consumption?"
- "Are there anomalous periods that need investigation?"

## Reporting Format

For each run, store:

- provider
- question
- summary
- findings
- validation statuses
- response time
- warning/fallback metadata

## Acceptance Targets (MVP)

- Structured validity: `>= 99%`
- Unsupported claim rate: `< 15%`
- Fallback handling: always returns valid structured response

## Next Steps

- Add automated evaluation script under `backend/tests` or `backend/tools`
- Track historical metrics over time
- Add regression gate in CI for major degradations
