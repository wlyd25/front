import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Box, Paper, Typography, Button, TextField, Grid, Card, CardContent, Alert, Snackbar, CircularProgress } from '@mui/material';
import { systemService } from '../../../api';

export default function RateLimitManagement() {
  const queryClient = useQueryClient();
  const [resetUserId, setResetUserId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { data: rateLimitStats, isLoading, refetch } = useQuery('rate-limit-stats', () => systemService.getRateLimitStats());
  
  const resetRateLimitMutation = useMutation((userId) => systemService.resetRateLimit(userId), {
    onSuccess: () => { queryClient.invalidateQueries('rate-limit-stats'); setSnackbar({ open: true, message: `تم إعادة تعيين حدود المستخدم`, severity: 'success' }); setResetUserId(''); },
  });
  
  const clearAllMutation = useMutation(() => systemService.clearAllRateLimits(), {
    onSuccess: () => { queryClient.invalidateQueries('rate-limit-stats'); setSnackbar({ open: true, message: 'تم مسح جميع الحدود', severity: 'success' }); },
  });
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>إدارة معدل الطلبات</Typography>
      {isLoading ? <CircularProgress /> : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}><Card><CardContent><Typography variant="h4" color="primary">{rateLimitStats?.data?.totalUsers || 0}</Typography><Typography variant="body2">إجمالي المستخدمين</Typography></CardContent></Card></Grid>
          <Grid item xs={6}><Card><CardContent><Typography variant="h4" color="warning.main">{rateLimitStats?.data?.blockedUsers || 0}</Typography><Typography variant="body2">مستخدمين محظورين</Typography></CardContent></Card></Grid>
        </Grid>
      )}
      <Box display="flex" gap={1} sx={{ mb: 2 }}><TextField size="small" placeholder="معرف المستخدم" value={resetUserId} onChange={(e) => setResetUserId(e.target.value)} fullWidth /><Button variant="outlined" onClick={() => resetRateLimitMutation.mutate(resetUserId)} disabled={!resetUserId}>إعادة تعيين</Button></Box>
      <Button variant="contained" color="error" onClick={() => clearAllMutation.mutate()} disabled={clearAllMutation.isLoading} fullWidth>{clearAllMutation.isLoading ? <CircularProgress size={24} /> : 'مسح جميع الحدود'}</Button>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Paper>
  );
}