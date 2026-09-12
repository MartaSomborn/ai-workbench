# AI-Assisted Development Notes

## Objective

Use AI coding assistance to accelerate delivery while preserving reliability and code quality.

## Working Rules Applied

For each feature:

1. Understand scope
2. Plan file-level changes
3. Implement incrementally
4. Run tests/lint/build
5. Review output contracts
6. Commit with focused messages

## What Worked Well

- Fast iteration on UI and API scaffolding
- Quick generation of typed response models
- Efficient drafting of docs and test cases
- Rapid recovery after integration mistakes using test feedback

## Risk Controls Used

- No blind trust in generated code
- Contract-first development (`Pydantic` models)
- Defensive normalization of provider output
- Mandatory verification via tests/lint/build before commit
- Minimal, scoped commits for traceability

## Prompting Patterns That Helped

- File-scoped requests ("update `app/main.py` route only")
- Expected output shape in prompt (keys + types)
- Explicit constraints (no day labels in commits, avoid committing local learning docs)
- Follow-up prompts for simple explanations to keep clarity

## Lessons Learned

- AI accelerates coding but not decision-making; architecture choices still require human control
- Strong tests are the best guardrail against subtle regressions
- Structured outputs are essential when integrating model-generated content
- Automation (CLI + CI) is critical for shipping confidence
