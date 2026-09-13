import {
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import SectionContainer from './SectionContainer';
import type { DatasetProfile } from './types';

type DataPreviewSectionProps = {
  profile: DatasetProfile;
};

function DataPreviewSection({ profile }: DataPreviewSectionProps) {
  const theme = useTheme();

  return (
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
  );
}

export default DataPreviewSection;
