import type { ChangeEvent } from 'react';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import { Alert, Button, Chip, Stack, Typography } from '@mui/material';
import SectionContainer from './SectionContainer';

type DatasetInputSectionProps = {
  file: File | null;
  loading: boolean;
  error: string | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
};

function DatasetInputSection({
  file,
  loading,
  error,
  onFileChange,
  onAnalyze,
}: DatasetInputSectionProps) {
  return (
    <SectionContainer
      title='Dataset Input'
      subtitle='Upload your CSV and run instant profiling.'
      action={
        <Button
          variant='contained'
          startIcon={<AutoGraphRoundedIcon />}
          onClick={onAnalyze}
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
          <input type='file' accept='.csv' hidden onChange={onFileChange} />
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
  );
}

export default DatasetInputSection;
