from __future__ import annotations

from typing import Any

import pandas as pd


KEY_METRICS = ["energy", "energy_consumption", "temperature", "humidity", "occupancy"]


def _pick_target_column(df: pd.DataFrame) -> str | None:
    lowercase_map = {column.lower(): column for column in df.columns}

    for candidate in ("energy_consumption", "energy"):
        if candidate in lowercase_map:
            return lowercase_map[candidate]

    numeric_columns = df.select_dtypes(include="number").columns.tolist()
    return numeric_columns[0] if numeric_columns else None


def build_analysis_context(df: pd.DataFrame) -> dict[str, Any]:
    numeric_df = df.select_dtypes(include="number")
    numeric_columns = numeric_df.columns.tolist()
    target_column = _pick_target_column(df)

    missing_total = int(df.isna().sum().sum())

    evidence: list[dict[str, Any]] = [
        {"metric": "rows", "value": int(len(df))},
        {"metric": "columns", "value": int(len(df.columns))},
        {"metric": "missing_values_total", "value": missing_total},
    ]

    top_correlations: list[dict[str, float | str]] = []
    if target_column and target_column in numeric_df.columns and len(numeric_columns) > 1:
        correlations = numeric_df.corr(numeric_only=True)[target_column].drop(labels=[target_column])
        correlations = correlations.dropna().abs().sort_values(ascending=False).head(3)

        for column, value in correlations.items():
            top_correlations.append({"column": column, "value": float(value)})
            evidence.append(
                {
                    "metric": f"corr_{column}_to_{target_column}",
                    "value": round(float(value), 4),
                }
            )

    key_means: dict[str, float] = {}
    for column in numeric_columns:
        lower_column = column.lower()
        if any(metric in lower_column for metric in KEY_METRICS):
            key_means[column] = round(float(numeric_df[column].mean()), 4)

    if not key_means:
        for column in numeric_columns[:3]:
            key_means[column] = round(float(numeric_df[column].mean()), 4)

    return {
        "rows": int(len(df)),
        "columns": int(len(df.columns)),
        "column_names": df.columns.tolist(),
        "numeric_columns": numeric_columns,
        "target_column": target_column,
        "missing_values_total": missing_total,
        "key_means": key_means,
        "top_correlations": top_correlations,
        "evidence": evidence,
    }
