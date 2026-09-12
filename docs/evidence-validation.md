# Evidence Validation

## Why It Exists

LLM findings can sound confident even when unsupported. Evidence validation adds an explicit trust layer between model output and user-facing insights.

## Validation Model

Each finding is classified as one of:

- `supported`: strong evidence match
- `partial`: some evidence match, but incomplete
- `unsupported`: no meaningful evidence match

## Inputs

- `findings`: list of model-generated statements
- `evidence_metrics`: metrics extracted deterministically from dataset/context

## Process

1. Normalize finding text (case-insensitive matching)
2. Match against known metric tokens
3. Count and score matches
4. Assign status (`supported` / `partial` / `unsupported`)
5. Attach rationale and matched metrics for transparency

## Output Schema

Each validation item contains:

- `finding`
- `status`
- `matched_metrics`
- `rationale`

This schema is returned in API responses and displayed in frontend badges.

## Frontend Usage

The UI renders status badges beside each finding:

- green: supported
- amber: partial
- red: unsupported

This helps users interpret confidence quickly.

## Limitations

- Rule-based matching may miss semantic equivalents
- Status depends on quality and coverage of evidence extraction

## Planned Improvements

- synonym dictionary / semantic matching
- confidence score instead of discrete classes only
- metric lineage links from finding to raw columns
