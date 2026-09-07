from io import BytesIO

from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_profile_dataset():
    csv_content = b"""name,age,score
Alice,25,90
Bob,30,85
Charlie,28,95
"""

    response = client.post(
        "/datasets/profile",
        files={
            "file": (
                "test.csv",
                BytesIO(csv_content),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    payload = response.json()

    assert payload["rows"] == 3
    assert payload["columns"] == 3
    assert payload["column_names"] == ["name", "age", "score"]
    assert payload["numeric_columns"] == ["age", "score"]
    assert len(payload["preview"]) == 3
    assert "charts" in payload
    assert "line" in payload["charts"]
    assert "bar" in payload["charts"]
    assert "scatter" in payload["charts"]
