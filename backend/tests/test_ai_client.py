from app.ai.client import MockProvider, OllamaProvider, get_ai_provider


def test_get_ai_provider_defaults_to_mock(monkeypatch):
    monkeypatch.delenv("AI_PROVIDER", raising=False)

    provider = get_ai_provider()

    assert provider.name == "mock"


def test_mock_provider_returns_structured_response():
    provider = MockProvider()

    result = provider.analyze(
        question="What is related to energy consumption?",
        context={
            "rows": 100,
            "columns": 5,
            "numeric_columns": ["temperature", "energy_consumption", "occupancy"],
            "target_column": "energy_consumption",
            "top_correlations": [{"column": "temperature", "value": 0.72}],
            "evidence": [{"metric": "rows", "value": 100}],
        },
    )

    assert "summary" in result
    assert isinstance(result["findings"], list)
    assert isinstance(result["recommendations"], list)
    assert isinstance(result["evidence"], list)


def test_get_ai_provider_uses_ollama_when_configured(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "ollama")
    monkeypatch.setenv("OLLAMA_MODEL", "qwen2.5:7b")
    monkeypatch.setenv("OLLAMA_BASE_URL", "http://localhost:11434")

    provider = get_ai_provider()

    assert isinstance(provider, OllamaProvider)
    assert provider.name == "ollama"


def test_get_ai_provider_falls_back_to_mock_for_unknown_provider(monkeypatch):
    monkeypatch.setenv("AI_PROVIDER", "unknown-provider")

    provider = get_ai_provider()

    assert isinstance(provider, MockProvider)
    assert provider.name == "mock"
