import pandas as pd

from app.analysis.profiler import profile_dataframe


def test_profile_dataframe():
    df = pd.DataFrame(
        {
            "temperature": [20, 21, 22],
            "energy": [100, 110, 120],
        }
    )

    result = profile_dataframe(df)

    assert result["rows"] == 3
    assert result["columns"] == 2
    assert result["numeric_columns"] == ["temperature", "energy"]
    assert len(result["preview"]) == 3
    assert result["charts"]["line"]["y_key"] == "temperature"
    assert len(result["charts"]["line"]["data"]) == 3
    assert len(result["charts"]["bar"]["data"]) == 2
    assert result["charts"]["scatter"]["x_key"] == "temperature"
    assert result["charts"]["scatter"]["y_key"] == "energy"
