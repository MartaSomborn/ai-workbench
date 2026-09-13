import { useMemo, useState } from 'react';
import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Legend,
} from 'recharts';

type DatasetProfile = {
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

type AskAnalysis = {
  summary: string;
  findings: string[];
  recommendations: string[];
  evidence: Array<{
    metric: string;
    value: string | number;
  }>;
};

type FindingValidation = {
  finding: string;
  status: 'supported' | 'unsupported' | 'partial';
  matched_metrics: string[];
  rationale: string;
};

type AskResponse = {
  provider: string;
  question: string;
  analysis: AskAnalysis;
  validation: FindingValidation[];
  requested_provider?: string;
  warning?: string;
};

type ReportResponse = {
  report_id: string;
  report_path: string;
  markdown: string;
  provider: string;
  question: string;
  requested_provider?: string;
  warning?: string;
};

const API_BASE_URL = 'http://127.0.0.1:8000';

const prettyLabel = (raw: string): string =>
  raw
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const statusLabel: Record<FindingValidation['status'], string> = {
  supported: 'Supported',
  partial: 'Partial',
  unsupported: 'Unsupported',
};

type SectionContainerProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
};

function SectionContainer({
  title,
  subtitle,
  action,
  children,
}: SectionContainerProps) {
  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 4 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1.5}
        sx={{ justifyContent: 'space-between' }}
      >
        <Box>
          <Typography variant='h2'>{title}</Typography>
          {subtitle && (
            <Typography variant='body2' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      <Divider sx={{ my: 2 }} />
      {children}
    </Paper>
  );
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Paper
      variant='outlined'
      sx={{
        p: 1.5,
        borderRadius: 3,
        transition: 'all 160ms ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: (theme) => `0 12px 28px ${theme.palette.primary.main}22`,
        },
      }}
    >
      <Typography variant='caption' color='text.secondary'>
        {label}
      </Typography>
      <Typography variant='h3' sx={{ mt: 0.5 }}>
        {value}
      </Typography>
    </Paper>
  );
}

function App() {
  const theme = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [askResult, setAskResult] = useState<AskResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [reportResult, setReportResult] = useState<ReportResponse | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;

    setFile(selectedFile);
    setProfile(null);
    setError(null);
    setAskError(null);
    setAskResult(null);
    setReportError(null);
    setReportResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file.');
      return;
    }

    setLoading(true);
    setError(null);
    setProfile(null);
    setAskError(null);
    setAskResult(null);
    setReportError(null);
    setReportResult(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post<DatasetProfile>(
        `${API_BASE_URL}/datasets/profile`,
        formData,
      );

      setProfile(response.data);
    } catch {
      setError('Could not analyze the dataset.');
    } finally {
      setLoading(false);
    }
  };

  const handleAskDataset = async () => {
    if (!file) {
      setAskError('Please upload a CSV file first.');
      return;
    }

    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      setAskError('Please enter a question about your dataset.');
      return;
    }

    setAskLoading(true);
    setAskError(null);
    setAskResult(null);

    const formData = new FormData();
    formData.append('question', trimmedQuestion);
    formData.append('file', file);

    try {
      const response = await axios.post<AskResponse>(
        `${API_BASE_URL}/datasets/ask`,
        formData,
      );

      setAskResult(response.data);
    } catch {
      setAskError('Could not analyze your question.');
    } finally {
      setAskLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!file) {
      setReportError('Please upload a CSV file first.');
      return;
    }

    setReportLoading(true);
    setReportError(null);
    setReportResult(null);

    const formData = new FormData();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion) {
      formData.append('question', trimmedQuestion);
    }
    formData.append('file', file);

    try {
      const response = await axios.post<ReportResponse>(
        `${API_BASE_URL}/datasets/report`,
        formData,
      );

      setReportResult(response.data);
    } catch {
      setReportError('Could not generate the report.');
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!reportResult) {
      return;
    }

    const blob = new Blob([reportResult.markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${reportResult.report_id}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const lineYAxisLabel = profile?.charts.line.y_key
    ? prettyLabel(profile.charts.line.y_key)
    : 'Value';
  const totalMissingValues = useMemo(
    () =>
      profile
        ? Object.values(profile.missing_values).reduce(
            (accumulator, current) => accumulator + current,
            0,
          )
        : 0,
    [profile],
  );

  const statusPalette: Record<
    FindingValidation['status'],
    'success' | 'warning' | 'error'
  > = {
    supported: 'success',
    partial: 'warning',
    unsupported: 'error',
  };

  return (
    <Box sx={{ pb: 5 }}>
      <Container
        maxWidth='xl'
        sx={{ py: { xs: 3, md: 5 }, display: 'grid', gap: 3 }}
      >
        <Paper
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 5,
            background: `linear-gradient(125deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 55%, ${theme.palette.secondary.main} 120%)`,
            color: 'common.white',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{ justifyContent: 'space-between' }}
          >
            <Box>
              <Typography variant='h1' color='common.white'>
                AI Workbench Dashboard
              </Typography>
              <Typography sx={{ opacity: 0.92 }}>
                Beautiful analytics for CSV profiling, anomaly detection, and
                evidence-backed AI insights.
              </Typography>
            </Box>
            <Stack
              direction='row'
              spacing={1}
              sx={{ alignItems: 'flex-start' }}
            >
              <Chip
                label='React + TypeScript'
                color='default'
                sx={{ bgcolor: '#ffffff22', color: 'common.white' }}
              />
              <Chip
                label='MUI Themed'
                color='default'
                sx={{ bgcolor: '#ffffff22', color: 'common.white' }}
              />
            </Stack>
          </Stack>
        </Paper>

        <SectionContainer
          title='Dataset Input'
          subtitle='Upload your CSV and run instant profiling.'
          action={
            <Button
              variant='contained'
              startIcon={<AutoGraphRoundedIcon />}
              onClick={handleUpload}
              disabled={loading || !file}
              aria-label='Analyze dataset'
            >
              {loading ? 'Analyzing…' : 'Analyze dataset'}
            </Button>
          }
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
          >
            <Button
              component='label'
              variant='outlined'
              startIcon={<UploadFileRoundedIcon />}
            >
              Select CSV
              <input
                type='file'
                accept='.csv'
                hidden
                onChange={handleFileChange}
              />
            </Button>
            {file ? (
              <Chip
                color='secondary'
                variant='outlined'
                label={`Selected: ${file.name}`}
              />
            ) : (
              <Typography variant='body2' color='text.secondary'>
                No file selected yet.
              </Typography>
            )}
          </Stack>
          {error && (
            <Alert severity='error' sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </SectionContainer>

        {loading && (
          <SectionContainer
            title='Loading analytics'
            subtitle='Preparing charts and profile details...'
          >
            <Stack spacing={1.5}>
              <Skeleton variant='rounded' height={38} />
              <Skeleton variant='rounded' height={320} />
              <Skeleton variant='rounded' height={320} />
            </Stack>
          </SectionContainer>
        )}

        {!loading && !profile && (
          <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
            <InsightsRoundedIcon color='primary' sx={{ fontSize: 44 }} />
            <Typography variant='h2' sx={{ mt: 1 }}>
              Ready for analysis
            </Typography>
            <Typography color='text.secondary' sx={{ mt: 1 }}>
              Upload a CSV and click <strong>Analyze dataset</strong> to unlock
              charts, findings, and report automation.
            </Typography>
          </Paper>
        )}

        {profile && (
          <>
            <SectionContainer
              title='Dataset Overview'
              subtitle='Key quality and shape indicators from the uploaded data.'
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: 1.5,
                }}
              >
                <MetricCard
                  label='Rows'
                  value={profile.rows.toLocaleString()}
                />
                <MetricCard label='Columns' value={profile.columns} />
                <MetricCard
                  label='Numeric Columns'
                  value={profile.numeric_columns.length}
                />
                <MetricCard label='Missing Values' value={totalMissingValues} />
                <MetricCard label='Anomalies' value={profile.anomalies.count} />
                <MetricCard
                  label='Anomaly Rate'
                  value={`${(profile.anomalies.rate * 100).toFixed(2)}%`}
                />
              </Box>

              <Typography variant='h3' sx={{ mt: 2.5, mb: 1 }}>
                Columns
              </Typography>
              <Stack direction='row' spacing={1} sx={{ flexWrap: 'wrap' }}>
                {profile.column_names.map((column) => (
                  <Chip key={column} label={column} variant='outlined' />
                ))}
              </Stack>
            </SectionContainer>

            <SectionContainer
              title='Data Preview'
              subtitle='First rows with anomaly status indicators.'
            >
              <TableContainer
                component={Paper}
                variant='outlined'
                sx={{ borderRadius: 3 }}
              >
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      {profile.column_names.map((column) => (
                        <TableCell key={column}>{column}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profile.preview.map((row, index) => {
                      const isAnomaly = profile.anomalies.preview_flags[index];
                      return (
                        <TableRow
                          hover
                          key={`preview-${index}`}
                          sx={
                            isAnomaly
                              ? {
                                  bgcolor: `${theme.palette.warning.light}2A`,
                                  '&:hover': {
                                    bgcolor: `${theme.palette.warning.light}44`,
                                  },
                                }
                              : undefined
                          }
                        >
                          <TableCell>
                            <Chip
                              size='small'
                              color={isAnomaly ? 'warning' : 'success'}
                              label={isAnomaly ? 'Anomaly' : 'Normal'}
                            />
                          </TableCell>
                          {profile.column_names.map((column) => (
                            <TableCell key={`${column}-${index}`}>
                              {String(row[column] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionContainer>

            <SectionContainer
              title='Charts'
              subtitle='Beautiful chart views generated from numeric columns.'
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    lg: 'repeat(3, minmax(0, 1fr))',
                  },
                  gap: 1.5,
                }}
              >
                <Paper variant='outlined' sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant='h3'>Line Chart</Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    {profile.charts.line.y_key
                      ? `${prettyLabel(profile.charts.line.y_key)} trend by sample index`
                      : 'Not enough numeric data for this chart.'}
                  </Typography>
                  {profile.charts.line.y_key &&
                  profile.charts.line.data.length > 0 ? (
                    <Box sx={{ height: 280 }}>
                      <ResponsiveContainer width='100%' height='100%'>
                        <LineChart data={profile.charts.line.data}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey={profile.charts.line.x_key} />
                          <YAxis
                            label={{
                              value: lineYAxisLabel,
                              angle: -90,
                              position: 'insideLeft',
                            }}
                          />
                          <Tooltip />
                          <Line
                            type='monotone'
                            dataKey={profile.charts.line.y_key}
                            stroke={theme.palette.primary.main}
                            strokeWidth={2.5}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Alert severity='info' variant='outlined'>
                      Not enough numeric data for a line chart.
                    </Alert>
                  )}
                </Paper>

                <Paper variant='outlined' sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant='h3'>Bar Chart</Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    Mean and median across numeric columns.
                  </Typography>
                  {profile.charts.bar.data.length > 0 ? (
                    <Box sx={{ height: 280 }}>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={profile.charts.bar.data}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis dataKey={profile.charts.bar.x_key} />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey='mean'
                            fill={theme.palette.info.main}
                            radius={[8, 8, 0, 0]}
                          />
                          <Bar
                            dataKey='median'
                            fill={theme.palette.secondary.main}
                            radius={[8, 8, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Alert severity='info' variant='outlined'>
                      Not enough numeric data for a bar chart.
                    </Alert>
                  )}
                </Paper>

                <Paper variant='outlined' sx={{ p: 2, borderRadius: 3 }}>
                  <Typography variant='h3'>Scatter Plot</Typography>
                  <Typography
                    variant='body2'
                    color='text.secondary'
                    sx={{ mb: 1 }}
                  >
                    {profile.charts.scatter.x_key &&
                    profile.charts.scatter.y_key
                      ? `${prettyLabel(profile.charts.scatter.y_key)} vs ${prettyLabel(profile.charts.scatter.x_key)}`
                      : 'Not enough numeric data for this chart.'}
                  </Typography>
                  {profile.charts.scatter.x_key &&
                  profile.charts.scatter.y_key &&
                  profile.charts.scatter.data.length > 0 ? (
                    <Box sx={{ height: 280 }}>
                      <ResponsiveContainer width='100%' height='100%'>
                        <ScatterChart>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            type='number'
                            dataKey='x'
                            name={profile.charts.scatter.x_key}
                          />
                          <YAxis
                            type='number'
                            dataKey='y'
                            name={profile.charts.scatter.y_key}
                          />
                          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter
                            data={profile.charts.scatter.data}
                            fill={theme.palette.warning.main}
                          />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Alert severity='info' variant='outlined'>
                      Not enough numeric data for a scatter plot.
                    </Alert>
                  )}
                </Paper>
              </Box>
            </SectionContainer>

            <SectionContainer
              title='Ask Your Dataset'
              subtitle='Generate structured insights and markdown reports from your uploaded data.'
              action={
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <Button
                    variant='contained'
                    onClick={handleAskDataset}
                    disabled={askLoading || loading || !file}
                  >
                    {askLoading ? 'Analyzing question…' : 'Analyze question'}
                  </Button>
                  <Button
                    variant='outlined'
                    startIcon={<DescriptionRoundedIcon />}
                    onClick={handleGenerateReport}
                    disabled={reportLoading || loading || !file}
                  >
                    {reportLoading
                      ? 'Generating report…'
                      : 'Generate markdown report'}
                  </Button>
                </Stack>
              }
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder='What factors are related to high energy consumption?'
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                helperText='Use a specific question for better findings.'
              />

              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {askError && <Alert severity='error'>{askError}</Alert>}
                {reportError && <Alert severity='error'>{reportError}</Alert>}
              </Stack>

              {askResult && (
                <Paper variant='outlined' sx={{ mt: 2, p: 2, borderRadius: 3 }}>
                  <Stack
                    direction='row'
                    spacing={1}
                    sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }}
                  >
                    <Chip
                      color='info'
                      variant='outlined'
                      label={`Provider: ${askResult.provider}`}
                    />
                    <Typography variant='caption' color='text.secondary'>
                      Question: {askResult.question}
                    </Typography>
                  </Stack>
                  {askResult.warning && (
                    <Alert severity='warning' sx={{ mt: 1.5 }}>
                      Fallback used: requested{' '}
                      {askResult.requested_provider ?? 'provider'} but switched
                      to {askResult.provider}. {askResult.warning}
                    </Alert>
                  )}

                  <Typography variant='h3' sx={{ mt: 2 }}>
                    Summary
                  </Typography>
                  <Typography color='text.secondary' sx={{ mt: 0.75 }}>
                    {askResult.analysis.summary}
                  </Typography>

                  <Typography variant='h3' sx={{ mt: 2 }}>
                    Findings
                  </Typography>
                  {askResult.analysis.findings.length > 0 ? (
                    <List dense disablePadding sx={{ mt: 0.5 }}>
                      {askResult.analysis.findings.map((finding, index) => {
                        const validationItem = askResult.validation[index];
                        const status = validationItem?.status;

                        return (
                          <ListItem
                            key={`finding-${index}`}
                            sx={{
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 2,
                              alignItems: 'flex-start',
                              my: 0.75,
                              px: 1.5,
                              py: 1.2,
                            }}
                          >
                            <ListItemText
                              primary={finding}
                              secondary={
                                <>
                                  {validationItem?.rationale && (
                                    <Typography
                                      variant='body2'
                                      color='text.secondary'
                                      sx={{ mt: 0.6 }}
                                    >
                                      {validationItem.rationale}
                                    </Typography>
                                  )}
                                  {validationItem?.matched_metrics.length ? (
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                    >
                                      Matched:{' '}
                                      {validationItem.matched_metrics.join(
                                        ', ',
                                      )}
                                    </Typography>
                                  ) : null}
                                </>
                              }
                            />
                            {status && (
                              <Chip
                                size='small'
                                color={statusPalette[status]}
                                label={statusLabel[status]}
                                sx={{ ml: 1 }}
                              />
                            )}
                          </ListItem>
                        );
                      })}
                    </List>
                  ) : (
                    <Alert severity='info' variant='outlined' sx={{ mt: 1 }}>
                      No findings returned.
                    </Alert>
                  )}

                  <Typography variant='h3' sx={{ mt: 2 }}>
                    Recommendations
                  </Typography>
                  {askResult.analysis.recommendations.length > 0 ? (
                    <List dense>
                      {askResult.analysis.recommendations.map(
                        (recommendation, index) => (
                          <ListItem
                            key={`recommendation-${index}`}
                            sx={{ py: 0.4 }}
                          >
                            <ListItemText primary={recommendation} />
                          </ListItem>
                        ),
                      )}
                    </List>
                  ) : (
                    <Alert severity='info' variant='outlined' sx={{ mt: 1 }}>
                      No recommendations returned.
                    </Alert>
                  )}

                  <Typography variant='h3' sx={{ mt: 2 }}>
                    Evidence
                  </Typography>
                  {askResult.analysis.evidence.length > 0 ? (
                    <TableContainer
                      component={Paper}
                      variant='outlined'
                      sx={{ mt: 1, borderRadius: 2 }}
                    >
                      <Table size='small'>
                        <TableHead>
                          <TableRow>
                            <TableCell>Metric</TableCell>
                            <TableCell>Value</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {askResult.analysis.evidence.map((item, index) => (
                            <TableRow
                              key={`evidence-${item.metric}-${index}`}
                              hover
                            >
                              <TableCell>{item.metric}</TableCell>
                              <TableCell>{String(item.value)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity='info' variant='outlined' sx={{ mt: 1 }}>
                      No evidence returned.
                    </Alert>
                  )}
                </Paper>
              )}

              {reportResult && (
                <Paper variant='outlined' sx={{ mt: 2, p: 2, borderRadius: 3 }}>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <Box>
                      <Chip
                        color='secondary'
                        label={`Report ID: ${reportResult.report_id}`}
                      />
                      <Typography
                        variant='body2'
                        color='text.secondary'
                        sx={{ mt: 1 }}
                      >
                        Saved at: {reportResult.report_path}
                      </Typography>
                    </Box>
                    <Button variant='contained' onClick={handleDownloadReport}>
                      Download .md file
                    </Button>
                  </Stack>

                  {reportResult.warning && (
                    <Alert severity='warning' sx={{ mt: 1.5 }}>
                      Fallback used: requested{' '}
                      {reportResult.requested_provider ?? 'provider'} but
                      switched to {reportResult.provider}.{' '}
                      {reportResult.warning}
                    </Alert>
                  )}

                  <Typography variant='h3' sx={{ mt: 2 }}>
                    Markdown Preview
                  </Typography>
                  <Box
                    component='pre'
                    sx={{
                      mt: 1,
                      mb: 0,
                      p: 2,
                      maxHeight: 320,
                      overflow: 'auto',
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: '#0F172A',
                      color: '#E2E8F0',
                      fontSize: '0.82rem',
                    }}
                  >
                    {reportResult.markdown}
                  </Box>
                </Paper>
              )}
            </SectionContainer>
          </>
        )}
      </Container>
    </Box>
  );
}

export default App;
