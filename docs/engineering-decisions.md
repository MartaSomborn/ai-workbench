# Engineering Decisions

## 1) Shared Core Logic Across API and CLI

**Decision:** Reuse the same analysis modules for both transports.

**Why:** Prevent behavior drift and duplicate bugs.

**Trade-off:** Slightly more upfront modularization effort.

## 2) Strict Structured Response Contracts

**Decision:** Use typed models for ask/report outputs.

**Why:** Keep frontend/backend contracts stable and testable.

**Trade-off:** Need explicit normalization for malformed provider outputs.

## 3) Provider Abstraction with Fallback

**Decision:** Default to `mock`, optional `ollama`, fallback on failure.

**Why:** No-cost baseline + resilient runtime behavior.

**Trade-off:** Mock can mask quality issues if overused; evaluation is required.

## 4) Deterministic Context Instead of Raw CSV Prompting

**Decision:** Send summarized context to providers.

**Why:** Lower token cost, reduced exposure risk, more predictable outputs.

**Trade-off:** May omit niche details not included in context extraction.

## 5) Evidence Validation Layer

**Decision:** Classify findings as supported/partial/unsupported.

**Why:** Improve trust and transparency for AI-generated insights.

**Trade-off:** Rule-based approach can be conservative or miss paraphrases.

## 6) IsolationForest for Anomaly Detection

**Decision:** Use `IsolationForest` with numeric features and median imputation.

**Why:** Practical multivariate outlier detection with minimal tuning.

**Trade-off:** Not fully interpretable; needs explainability improvements later.

## 7) Markdown Reports as First Artifact

**Decision:** Generate `.md` reports from profile + analysis + validation.

**Why:** Easy to store, review, share, and version-control.

**Trade-off:** Not as presentation-rich as PDF/HTML dashboards.

## 8) CI Early, Full DevOps Later

**Decision:** Add GitHub Actions lint/test/build gate now.

**Why:** Prevent regressions before release.

**Trade-off:** Docker/release automation postponed to keep scope manageable.

## 9) Minimal, Focused Commits

**Decision:** Split backend/frontend concerns and avoid mixing local-only notes.

**Why:** Improves traceability and rollback safety.

**Trade-off:** More frequent commit management overhead.
