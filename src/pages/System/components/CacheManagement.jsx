import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Box, Paper, Typography, Button, TextField, Grid, Card, CardContent, Alert, Snackbar, CircularProgress } from '@mui/material';
import { systemService } from '../../../api';

export default function CacheManagement() {
  const queryClient = useQueryClient();
  const [clearPattern, setClearPattern] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { data: cacheStats, isLoading, refetch } = useQuery('cache-stats', () => systemService.getCacheStats(), { refetchInterval: 30000 });
  
  const clearCacheMutation = useMutation(() => systemService.clearCache(), {
    onSuccess: () => { queryClient.invalidateQueries('cache-stats'); setSnackbar({ open: true, message: 'تم مسح الكاش بنجاح', severity: 'success' }); },
    onError: () => setSnackbar({ open: true, message: 'فشل مسح الكاش', severity: 'error' }),
  });
  
  const clearPatternMutation = useMutation((pattern) => systemService.clearCacheByPattern(pattern), {
    onSuccess: () => { queryClient.invalidateQueries('cache-stats'); setSnackbar({ open: true, message: `تم مسح الكاش للنمط: ${clearPattern}`, severity: 'success' }); setClearPattern(''); },
  });
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" mb={2}>إدارة الكاش</Typography>
      {isLoading ? <CircularProgress /> : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6}><Card><CardContent><Typography variant="h4" color="primary">{cacheStats?.data?.totalKeys || 0}</Typography><Typography variant="body2">إجمالي المفاتيح</Typography></CardContent></Card></Grid>
          <Grid item xs={6}><Card><CardContent><Typography variant="h4" color="success.main">{cacheStats?.data?.memoryUsage || '0 MB'}</Typography><Typography variant="body2">استخدام الذاكرة</Typography></CardContent></Card></Grid>
        </Grid>
      )}
      <Button variant="contained" color="error" onClick={() => clearCacheMutation.mutate()} disabled={clearCacheMutation.isLoading} fullWidth sx={{ mb: 2 }}>{clearCacheMutation.isLoading ? <CircularProgress size={24} /> : 'مسح الكاش بالكامل'}</Button>
      <Box display="flex" gap={1}><TextField size="small" placeholder="نمط المسح (مثال: users:*)" value={clearPattern} onChange={(e) => setClearPattern(e.target.value)} fullWidth /><Button variant="outlined" onClick={() => clearPatternMutation.mutate(clearPattern)} disabled={!clearPattern}>مسح</Button></Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}><Alert severity={snackbar.severity}>{snackbar.message}</Alert></Snackbar>
    </Paper>
  );
}