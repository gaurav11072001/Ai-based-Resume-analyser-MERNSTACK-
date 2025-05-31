import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

const ScoreCircle = ({ score }) => {
  // Determine color based on score
  const getColor = (score) => {
    if (score >= 80) return '#4caf50'; // Green
    if (score >= 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  const color = getColor(score);

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={score}
        size={120}
        thickness={5}
        sx={{
          color: color,
          circle: {
            strokeLinecap: 'round',
          },
        }}
      />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h4"
          component="div"
          color="text.primary"
          fontWeight="bold"
        >
          {score}
        </Typography>
      </Box>
    </Box>
  );
};

export default ScoreCircle;
