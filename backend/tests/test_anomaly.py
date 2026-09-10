import pandas as pd

from app.analysis.anomaly import detect_anomalies


def test_detect_anomalies_returns_expected_shape():
    df = pd.DataFrame(
        {
            "temperature": [20, 21, 22, 23, 24],
            "energy": [100, 110, 120, 130, 140],
        }
    )

    result = detect_anomalies(df)

    assert "count" in result
    assert "rate" in result
    assert "preview_flags" in result
    assert "numeric_columns_used" in result
    assert len(result["preview_flags"]) == len(df)
    assert 0 <= result["count"] <= len(df)


def test_detect_anomalies_handles_no_numeric_columns():
    df = pd.DataFrame(
        {
            "name": ["a", "b", "c"],
            "status": ["ok", "ok", "warn"],
        }
    )

    result = detect_anomalies(df)

    assert result["count"] == 0
    assert result["rate"] == 0.0
    assert result["numeric_columns_used"] == []
    assert result["preview_flags"] == [False, False, False]
