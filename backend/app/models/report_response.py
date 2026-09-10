from pydantic import BaseModel


class ReportResponse(BaseModel):
    report_id: str
    report_path: str
    markdown: str
    provider: str
    question: str
    requested_provider: str | None = None
    warning: str | None = None