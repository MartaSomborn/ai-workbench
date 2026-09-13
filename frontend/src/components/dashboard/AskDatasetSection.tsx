import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import {
  Alert,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
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
import SectionContainer from './SectionContainer';
import type { AskResponse, FindingValidation, ReportResponse } from './types';

type AskDatasetSectionProps = {
  file: File | null;
  loading: boolean;
  question: string;
  askLoading: boolean;
  askError: string | null;
  askResult: AskResponse | null;
  reportLoading: boolean;
  reportError: string | null;
  reportResult: ReportResponse | null;
  onQuestionChange: (value: string) => void;
  onAskDataset: () => void;
  onGenerateReport: () => void;
  onDownloadReport: () => void;
};

const statusLabel: Record<FindingValidation['status'], string> = {
  supported: 'Supported',
  partial: 'Partial',
  unsupported: 'Unsupported',
};

const statusPalette: Record<
  FindingValidation['status'],
  'success' | 'warning' | 'error'
> = {
  supported: 'success',
  partial: 'warning',
  unsupported: 'error',
};

function AskDatasetSection({
  file,
  loading,
  question,
  askLoading,
  askError,
  askResult,
  reportLoading,
  reportError,
  reportResult,
  onQuestionChange,
  onAskDataset,
  onGenerateReport,
  onDownloadReport,
}: AskDatasetSectionProps) {
  const theme = useTheme();

  return (
    <SectionContainer
      title='Ask Your Dataset'
      subtitle='Generate structured insights and markdown reports from your uploaded data.'
      action={
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <Button
            variant='contained'
            onClick={onAskDataset}
            disabled={askLoading || loading || !file}
          >
            {askLoading ? 'Analyzing question…' : 'Analyze question'}
          </Button>
          <Button
            variant='outlined'
            startIcon={<DescriptionRoundedIcon />}
            onClick={onGenerateReport}
            disabled={reportLoading || loading || !file}
          >
            {reportLoading ? 'Generating report…' : 'Generate markdown report'}
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
        onChange={(event) => onQuestionChange(event.target.value)}
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
              {askResult.requested_provider ?? 'provider'} but switched to{' '}
              {askResult.provider}. {askResult.warning}
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
                              {validationItem.matched_metrics.join(', ')}
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
                  <ListItem key={`recommendation-${index}`} sx={{ py: 0.4 }}>
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
                    <TableRow key={`evidence-${item.metric}-${index}`} hover>
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
              <Typography variant='body2' color='text.secondary' sx={{ mt: 1 }}>
                Saved at: {reportResult.report_path}
              </Typography>
            </Box>
            <Button variant='contained' onClick={onDownloadReport}>
              Download .md file
            </Button>
          </Stack>

          {reportResult.warning && (
            <Alert severity='warning' sx={{ mt: 1.5 }}>
              Fallback used: requested{' '}
              {reportResult.requested_provider ?? 'provider'} but switched to{' '}
              {reportResult.provider}. {reportResult.warning}
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
  );
}

export default AskDatasetSection;
