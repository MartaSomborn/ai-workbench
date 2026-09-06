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

    assert response.json() == {
        "rows": 3,
        "columns": 3,
        "column_names": [
            "name",
            "age",
            "score",
        ],
    }
