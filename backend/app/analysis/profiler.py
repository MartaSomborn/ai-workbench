import pandas as pd

from app.analysis.anomaly import detect_anomalies


def profile_dataframe(df: pd.DataFrame) -> dict:
    numeric_df = df.select_dtypes(include="number")
    numeric_columns = numeric_df.columns.tolist()

    missing_values = {
        column: int(count)
        for column, count in df.isna().sum().to_dict().items()
        if int(count) > 0
    }

    line_data = []
    if numeric_columns:
        line_column = numeric_columns[0]
        line_series = numeric_df[line_column].head(100).tolist()
        line_data = [
            {"index": index + 1, line_column: value}
            for index, value in enumerate(line_series)
        ]

    bar_data = [
        {
            "column": column,
            "mean": float(numeric_df[column].mean()),
            "median": float(numeric_df[column].median()),
        }
        for column in numeric_columns[:8]
    ]

    scatter_data = []
    if len(numeric_columns) >= 2:
        x_column = numeric_columns[0]
        y_column = numeric_columns[1]

        sample = numeric_df[[x_column, y_column]].dropna().head(200)
        scatter_data = [
            {"x": float(row[x_column]), "y": float(row[y_column])}
            for _, row in sample.iterrows()
        ]

    anomalies = detect_anomalies(df)

    return {
        "rows": len(df),
        "columns": len(df.columns),
        "column_names": df.columns.tolist(),
        "numeric_columns": numeric_columns,
        "missing_values": missing_values,
        "preview": df.head(10).fillna("").to_dict(orient="records"),
        "anomalies": anomalies,
        "charts": {
            "line": {
                "x_key": "index",
                "y_key": numeric_columns[0] if numeric_columns else None,
                "data": line_data,
            },
            "bar": {
                "x_key": "column",
                "series_keys": ["mean", "median"],
                "data": bar_data,
            },
            "scatter": {
                "x_key": numeric_columns[0] if len(numeric_columns) >= 1 else None,
                "y_key": numeric_columns[1] if len(numeric_columns) >= 2 else None,
                "data": scatter_data,
            },
        },
    }
