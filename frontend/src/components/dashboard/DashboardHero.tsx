import { Box, Chip, Paper, Stack, Typography, useTheme } from '@mui/material';

type DashboardHeroProps = {
  currentDateLabel: string;
  currentHourLabel: string;
};

function DashboardHero({
  currentDateLabel,
  currentHourLabel,
}: DashboardHeroProps) {
  const theme = useTheme();

  return (
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
        <Stack direction='row' spacing={1} sx={{ alignItems: 'flex-start' }}>
          <Chip
            label={`Date: ${currentDateLabel}`}
            color='default'
            sx={{ bgcolor: '#ffffff22', color: 'common.white' }}
          />
          <Chip
            label={`Hour: ${currentHourLabel} UTC`}
            color='default'
            sx={{ bgcolor: '#ffffff22', color: 'common.white' }}
          />
        </Stack>
      </Stack>
    </Paper>
  );
}

export default DashboardHero;
