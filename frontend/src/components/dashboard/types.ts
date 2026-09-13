export type DatasetProfile = {
  rows: number;
  columns: number;
  column_names: string[];
  numeric_columns: string[];
  missing_values: Record<string, number>;
  preview: Array<Record<string, string | number>>;
  anomalies: {
    count: number;
    rate: number;
    preview_flags: boolean[];
    numeric_columns_used: string[];
  };
  charts: {
    line: {
      x_key: string;
      y_key: string | null;
      data: Array<Record<string, string | number>>;
    };
    bar: {
      x_key: string;
      series_keys: string[];
      data: Array<Record<string, string | number>>;
    };
    scatter: {
      x_key: string | null;
      y_key: string | null;
      data: Array<Record<string, number>>;
    };
  };
};

export type AskAnalysis = {
  summary: string;
  findings: string[];
  recommendations: string[];
  evidence: Array<{
    metric: string;
    value: string | number;
  }>;
};

export type FindingValidation = {
  finding: string;
  status: 'supported' | 'unsupported' | 'partial';
  matched_metrics: string[];
  rationale: string;
};

export type AskResponse = {
  provider: string;
  question: string;
  analysis: AskAnalysis;
  validation: FindingValidation[];
  requested_provider?: string;
  warning?: string;
};

export type ReportResponse = {
  report_id: string;
  report_path: string;
  markdown: string;
  provider: string;
  question: string;
  requested_provider?: string;
  warning?: string;
};
