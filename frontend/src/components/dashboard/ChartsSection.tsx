import { Alert, Box, Paper, Typography, useTheme } from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import SectionContainer from './SectionContainer';
import type { DatasetProfile } from './types';

type ChartsSectionProps = {
  profile: DatasetProfile;
  prettyLabel: (raw: string) => string;
  lineYAxisLabel: string;
};

function ChartsSection({
  profile,
  prettyLabel,
  lineYAxisLabel,
}: ChartsSectionProps) {
  const theme = useTheme();

  return (
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
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            {profile.charts.line.y_key
              ? `${prettyLabel(profile.charts.line.y_key)} trend by sample index`
              : 'Not enough numeric data for this chart.'}
          </Typography>
          {profile.charts.line.y_key && profile.charts.line.data.length > 0 ? (
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
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
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
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            {profile.charts.scatter.x_key && profile.charts.scatter.y_key
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
  );
}

export default ChartsSection;
