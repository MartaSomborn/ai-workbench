import type { ReactNode } from 'react';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';

type SectionContainerProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
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

export default SectionContainer;
