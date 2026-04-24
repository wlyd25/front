// src/components/Common/LoadingSpinner.jsx

import { Box, CircularProgress, Typography, Skeleton, Paper } from '@mui/material';

export default function LoadingSpinner({ message = 'جاري التحميل...', fullPage = false, type = 'spinner' }) {
  if (fullPage) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        bgcolor="background.default"
      >
        {type === 'spinner' ? (
          <CircularProgress size={48} />
        ) : (
          <Skeleton variant="circular" width={48} height={48} />
        )}
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      </Box>
    );
  }

  if (type === 'skeleton') {
    return (
      <Box p={2}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2, borderRadius: 1 }} />
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
        <Box display="flex" gap={2} mt={2}>
          <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ flex: 1, borderRadius: 1 }} />
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 200,
        p: 3,
        bgcolor: 'transparent',
      }}
    >
      <CircularProgress size={40} />
      <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
        {message}
      </Typography>
    </Paper>
  );
}