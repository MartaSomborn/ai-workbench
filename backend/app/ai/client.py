from __future__ import annotations

import json
import os
from dataclasses import dataclass
from typing import Any, Protocol
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


class AIProvider(Protocol):
    name: str

    def analyze(self, question: str, context: dict[str, Any]) -> dict[str, Any]:
        ...


@dataclass
class MockProvider:
    name: str = "mock"

    def analyze(self, question: str, context: dict[str, Any]) -> dict[str, Any]:
        rows = context.get("rows", 0)
        columns = context.get("columns", 0)
        target_column = context.get("target_column")
        top_correlations = context.get("top_correlations", [])

        findings = [
            f"Dataset has {rows} rows and {columns} columns.",
            f"Numeric columns available: {', '.join(context.get('numeric_columns', [])[:6]) or 'none'}.",
        ]

        evidence = context.get("evidence", [])

        if target_column and top_correlations:
            strongest = top_correlations[0]
            findings.append(
                f"Strongest correlation to {target_column} is {strongest['column']} ({strongest['value']:.2f})."
            )

        return {
            "summary": f"Rule-based analysis for: {question}",
            "findings": findings,
            "recommendations": [
                "Validate assumptions with domain knowledge.",
                "Compare findings across additional time windows or segments.",
            ],
            "evidence": evidence,
        }


@dataclass
class OllamaProvider:
    model: str = "qwen2.5:7b"
    base_url: str = "http://localhost:11434"
    name: str = "ollama"

    def analyze(self, question: str, context: dict[str, Any]) -> dict[str, Any]:
        prompt = (
            "You are a data analyst. Use the provided context only and return valid JSON with keys: "
            "summary (string), findings (array of strings), recommendations (array of strings), "
            "evidence (array of objects with metric and value).\n\n"
            f"Question: {question}\n\n"
            f"Context: {json.dumps(context, ensure_ascii=False)}"
        )

        payload = {
            "model": self.model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False,
            "options": {"temperature": 0.2},
            "format": "json",
        }

        request = Request(
            url=f"{self.base_url}/api/chat",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlopen(request, timeout=30) as response:
                body = response.read().decode("utf-8")
        except HTTPError as exc:
            raise RuntimeError(f"Ollama HTTP error: {exc.code}") from exc
        except URLError as exc:
            raise RuntimeError("Could not connect to Ollama. Is `ollama serve` running?") from exc

        message_content = json.loads(body).get("message", {}).get("content", "{}")
        try:
            parsed = json.loads(message_content)
        except json.JSONDecodeError as exc:
            raise RuntimeError("Ollama response was not valid JSON.") from exc

        return {
            "summary": parsed.get("summary", "No summary returned."),
            "findings": parsed.get("findings", []),
            "recommendations": parsed.get("recommendations", []),
            "evidence": parsed.get("evidence", context.get("evidence", [])),
        }


def get_ai_provider() -> AIProvider:
    provider = os.getenv("AI_PROVIDER", "mock").strip().lower()

    if provider == "ollama":
        model = os.getenv("OLLAMA_MODEL", "qwen2.5:7b")
        base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        return OllamaProvider(model=model, base_url=base_url)

    return MockProvider()
