from __future__ import annotations

import pandas as pd
from sklearn.ensemble import IsolationForest


def detect_anomalies(
    df: pd.DataFrame,
    max_preview_rows: int = 10,
    contamination: float = 0.05,
) -> dict:
    numeric_df = df.select_dtypes(include="number")
    numeric_columns = numeric_df.columns.tolist()

    preview_length = min(len(df), max_preview_rows)
    default_preview_flags = [False] * preview_length

    if len(df) < 3 or not numeric_columns:
        return {
            "count": 0,
            "rate": 0.0,
            "preview_flags": default_preview_flags,
            "numeric_columns_used": numeric_columns,
        }

    working_df = numeric_df.copy().fillna(numeric_df.median(numeric_only=True))

    model = IsolationForest(
        contamination=contamination,
        random_state=42,
        n_estimators=200,
    )

    predictions = model.fit_predict(working_df)
    anomaly_flags = [bool(prediction == -1) for prediction in predictions]

    anomaly_count = sum(anomaly_flags)
    anomaly_rate = anomaly_count / len(df) if len(df) > 0 else 0.0

    return {
        "count": int(anomaly_count),
        "rate": round(float(anomaly_rate), 4),
        "preview_flags": anomaly_flags[:preview_length],
        "numeric_columns_used": numeric_columns,
    }
