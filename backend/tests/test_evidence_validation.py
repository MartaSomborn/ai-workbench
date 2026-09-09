from app.analysis.evidence_validation import validate_findings_against_evidence


def test_validate_findings_marks_partial_for_uncertain_language():
    results = validate_findings_against_evidence(
        findings=["Temperature may be related to energy consumption."],
        evidence_metrics=["corr_temperature_to_energy_consumption"],
    )

    assert len(results) == 1
    assert results[0]["status"] == "partial"
    assert "corr_temperature_to_energy_consumption" in results[0]["matched_metrics"]
