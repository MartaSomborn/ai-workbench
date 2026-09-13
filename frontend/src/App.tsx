import { useMemo, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import AskDatasetSection from './components/dashboard/AskDatasetSection';
import ChartsSection from './components/dashboard/ChartsSection';
import DashboardHero from './components/dashboard/DashboardHero';
import DataPreviewSection from './components/dashboard/DataPreviewSection';
import DatasetInputSection from './components/dashboard/DatasetInputSection';
import DatasetOverviewSection from './components/dashboard/DatasetOverviewSection';
import SectionContainer from './components/dashboard/SectionContainer';
import type {
  AskResponse,
  DatasetProfile,
  ReportResponse,
} from './components/dashboard/types';

const API_BASE_URL = 'http://127.0.0.1:8000';

const prettyLabel = (raw: string): string =>
  raw
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

function App() {
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

  const currentDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(new Date()),
    [],
  );

  const currentHourLabel = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    [],
  );

  return (
    <Box sx={{ pb: 5 }}>
      <Container
        maxWidth='xl'
        sx={{ py: { xs: 3, md: 5 }, display: 'grid', gap: 3 }}
      >
        <DashboardHero
          currentDateLabel={currentDateLabel}
          currentHourLabel={currentHourLabel}
        />

        <DatasetInputSection
          file={file}
          loading={loading}
          error={error}
          onFileChange={handleFileChange}
          onAnalyze={handleUpload}
        />

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
            <DatasetOverviewSection
              profile={profile}
              totalMissingValues={totalMissingValues}
            />
            <DataPreviewSection profile={profile} />
            <ChartsSection
              profile={profile}
              prettyLabel={prettyLabel}
              lineYAxisLabel={lineYAxisLabel}
            />
            <AskDatasetSection
              file={file}
              loading={loading}
              question={question}
              askLoading={askLoading}
              askError={askError}
              askResult={askResult}
              reportLoading={reportLoading}
              reportError={reportError}
              reportResult={reportResult}
              onQuestionChange={setQuestion}
              onAskDataset={handleAskDataset}
              onGenerateReport={handleGenerateReport}
              onDownloadReport={handleDownloadReport}
            />
          </>
        )}
      </Container>
    </Box>
  );
}

export default App;
