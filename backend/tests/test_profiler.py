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
