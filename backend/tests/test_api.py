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


def test_ask_dataset_with_mock_provider(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "mock")

    csv_content = b"""timestamp,temperature,energy_consumption,occupancy
2026-01-01 08:00,12.3,421,34
2026-01-01 09:00,13.1,452,41
2026-01-01 10:00,14.2,470,43
"""

    response = client.post(
        "/datasets/ask",
        data={"question": "What factors are related to high energy consumption?"},
        files={
            "file": (
                "energy.csv",
                BytesIO(csv_content),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    payload = response.json()

    assert payload["provider"] == "mock"
    assert "analysis" in payload
    assert "summary" in payload["analysis"]
    assert isinstance(payload["analysis"].get("findings", []), list)
    assert isinstance(payload["analysis"].get("evidence", []), list)


def test_ask_dataset_ollama_falls_back_to_mock(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "ollama")

    csv_content = b"""timestamp,temperature,energy_consumption,occupancy
2026-01-01 08:00,12.3,421,34
2026-01-01 09:00,13.1,452,41
2026-01-01 10:00,14.2,470,43
"""

    response = client.post(
        "/datasets/ask",
        data={"question": "What factors are related to high energy consumption?"},
        files={
            "file": (
                "energy.csv",
                BytesIO(csv_content),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    payload = response.json()

    assert payload["provider"] == "mock"
    assert payload["requested_provider"] == "ollama"
    assert "warning" in payload
    assert isinstance(payload["analysis"].get("findings", []), list)


def test_ask_dataset_normalizes_unstructured_provider_output(monkeypatch):
    class BrokenProvider:
        name = "broken"

        def analyze(self, question, context):
            return {
                "summary": 123,
                "findings": "not-a-list",
                "recommendations": None,
                "evidence": [{"metric": "rows"}, "bad-item"],
            }

    monkeypatch.setattr("app.main.get_ai_provider", lambda: BrokenProvider())

    csv_content = b"""timestamp,temperature,energy_consumption,occupancy
2026-01-01 08:00,12.3,421,34
2026-01-01 09:00,13.1,452,41
"""

    response = client.post(
        "/datasets/ask",
        data={"question": "test question"},
        files={
            "file": (
                "energy.csv",
                BytesIO(csv_content),
                "text/csv",
            )
        },
    )

    assert response.status_code == 200

    payload = response.json()

    assert payload["provider"] == "broken"
    assert payload["analysis"]["summary"] == "123"
    assert payload["analysis"]["findings"] == []
    assert payload["analysis"]["recommendations"] == []
    assert payload["analysis"]["evidence"][0]["metric"] == "rows"
