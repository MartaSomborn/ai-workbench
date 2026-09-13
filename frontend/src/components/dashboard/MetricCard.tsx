import { Paper, Typography } from '@mui/material';

type MetricCardProps = {
  label: string;
  value: string | number;
};

function MetricCard({ label, value }: MetricCardProps) {
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

export default MetricCard;
