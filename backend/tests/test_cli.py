from pathlib import Path

from ai_workbench.cli import main


def test_cli_analyze_generates_report(tmp_path, monkeypatch, capsys):
    monkeypatch.setenv("AI_PROVIDER", "mock")

    csv_file = tmp_path / "sample.csv"
    csv_file.write_text(
        "temperature,energy_consumption\n20,100\n21,110\n22,120\n",
        encoding="utf-8",
    )

    output_dir = tmp_path / "reports"

    exit_code = main(
        [
            "analyze",
            str(csv_file),
            "--question",
            "What drives energy?",
            "--output-dir",
            str(output_dir),
        ]
    )

    captured = capsys.readouterr()

    assert exit_code == 0
    assert "Analysis complete" in captured.out
    assert "Report Path:" in captured.out

    report_paths = [
        line.replace("Report Path: ", "")
        for line in captured.out.splitlines()
        if line.startswith("Report Path: ")
    ]
    assert len(report_paths) == 1

    report_path = Path(report_paths[0])
    assert report_path.exists()
    assert "# AI Workbench Report" in report_path.read_text(encoding="utf-8")


def test_cli_analyze_missing_file(capsys):
    exit_code = main(["analyze", "does-not-exist.csv"])
    captured = capsys.readouterr()

    assert exit_code == 1
    assert "Error: file not found:" in captured.err
