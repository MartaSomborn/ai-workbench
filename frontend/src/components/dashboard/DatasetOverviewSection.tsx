import { Box, Chip, Stack, Typography } from '@mui/material';
import MetricCard from './MetricCard';
import SectionContainer from './SectionContainer';
import type { DatasetProfile } from './types';

type DatasetOverviewSectionProps = {
  profile: DatasetProfile;
  totalMissingValues: number;
};

function DatasetOverviewSection({
  profile,
  totalMissingValues,
}: DatasetOverviewSectionProps) {
  return (
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
        <MetricCard label='Rows' value={profile.rows.toLocaleString()} />
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
  );
}

export default DatasetOverviewSection;
