import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  DeleteSweep,
  Speed,
  Security,
  ClearAll,
  PersonOff,
} from '@mui/icons-material';
import { systemService } from '../../api';

export default function System() {
  const queryClient = useQueryClient();
  const [clearPattern, setClearPattern] = useState('');
  const [resetUserId, setResetUserId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب إحصائيات الكاش
  const { data: cacheStats, isLoading: cacheLoading, refetch: refetchCache } = useQuery(
    'cache-stats',
    () => systemService.getCacheStats(),
    { refetchInterval: 30000 }
  );
  
  // جلب إحصائيات Rate Limit
  const { data: rateLimitStats, isLoading: rateLimitLoading, refetch: refetchRateLimit } = useQuery(
    'rate-limit-stats',
    () => systemService.getRateLimitStats()
  );
  
  // جلب رؤوس الأمان
  const { data: securityHeaders } = useQuery(
    'security-headers',
    () => systemService.getSecurityHeaders()
  );
  
  // مسح الكاش بالكامل
  const clearCacheMutation = useMutation(
    () => systemService.clearCache(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cache-stats');
        setSnackbar({ open: true, message: 'تم مسح الكاش بنجاح', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل مسح الكاش',
          severity: 'error',
        });
      },
    }
  );
  
  // مسح الكاش بنمط
  const clearCachePatternMutation = useMutation(
    (pattern) => systemService.clearCacheByPattern(pattern),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cache-stats');
        setSnackbar({ open: true, message: `تم مسح الكاش للنمط: ${clearPattern}`, severity: 'success' });
        setClearPattern('');
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل مسح الكاش',
          severity: 'error',
        });
      },
    }
  );
  
  // إعادة تعيين حدود مستخدم
  const resetRateLimitMutation = useMutation(
    (userId) => systemService.resetRateLimit(userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rate-limit-stats');
        setSnackbar({ open: true, message: `تم إعادة تعيين حدود المستخدم: ${resetUserId}`, severity: 'success' });
        setResetUserId('');
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل إعادة تعيين الحدود',
          severity: 'error',
        });
      },
    }
  );
  
  // مسح جميع حدود Rate Limit
  const clearAllRateLimitsMutation = useMutation(
    () => systemService.clearAllRateLimits(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('rate-limit-stats');
        setSnackbar({ open: true, message: 'تم مسح جميع حدود المعدل', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل مسح الحدود',
          severity: 'error',
        });
      },
    }
  );
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" mb={3}>
        إدارة النظام
      </Typography>
      
      <Grid container spacing={3}>
        {/* إدارة الكاش */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                إدارة الكاش
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={() => refetchCache()}
              >
                تحديث
              </Button>
            </Box>
            
            {cacheLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {cacheStats?.data?.totalKeys || 0}
                        </Typography>
                        <Typography variant="body2">إجمالي المفاتيح</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="success.main">
                          {cacheStats?.data?.memoryUsage || '0 MB'}
                        </Typography>
                        <Typography variant="body2">استخدام الذاكرة</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  أقسام الكاش
                </Typography>
                {cacheStats?.data?.sections?.map((section) => (
                  <Box key={section.name} display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{section.name}</Typography>
                    <Typography variant="body2">{section.keys} مفتاح</Typography>
                  </Box>
                ))}
                
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteSweep />}
                    onClick={() => clearCacheMutation.mutate()}
                    disabled={clearCacheMutation.isLoading}
                    fullWidth
                  >
                    {clearCacheMutation.isLoading ? <CircularProgress size={24} /> : 'مسح الكاش بالكامل'}
                  </Button>
                  
                  <Box display="flex" gap={1} mt={2}>
                    <TextField
                      size="small"
                      placeholder="نمط المسح (مثال: users:*)"
                      value={clearPattern}
                      onChange={(e) => setClearPattern(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      onClick={() => clearCachePatternMutation.mutate(clearPattern)}
                      disabled={!clearPattern || clearCachePatternMutation.isLoading}
                    >
                      مسح
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* إدارة Rate Limit */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">
                <Speed sx={{ mr: 1, verticalAlign: 'middle' }} />
                إدارة معدل الطلبات (Rate Limit)
              </Typography>
              <Button
                size="small"
                startIcon={<Refresh />}
                onClick={() => refetchRateLimit()}
              >
                تحديث
              </Button>
            </Box>
            
            {rateLimitLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="primary">
                          {rateLimitStats?.data?.totalUsers || 0}
                        </Typography>
                        <Typography variant="body2">إجمالي المستخدمين</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4" color="warning.main">
                          {rateLimitStats?.data?.blockedUsers || 0}
                        </Typography>
                        <Typography variant="body2">مستخدمين محظورين</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle2" gutterBottom>
                  أعلى المستخدمين طلباً
                </Typography>
                {rateLimitStats?.data?.topUsers?.slice(0, 5).map((user) => (
                  <Box key={user.userId} display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2">{user.userId}</Typography>
                    <Typography variant="body2">{user.requests} طلب</Typography>
                  </Box>
                ))}
                
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" gap={1}>
                    <TextField
                      size="small"
                      placeholder="معرف المستخدم"
                      value={resetUserId}
                      onChange={(e) => setResetUserId(e.target.value)}
                      fullWidth
                    />
                    <Button
                      variant="outlined"
                      startIcon={<PersonOff />}
                      onClick={() => resetRateLimitMutation.mutate(resetUserId)}
                      disabled={!resetUserId || resetRateLimitMutation.isLoading}
                    >
                      إعادة تعيين
                    </Button>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<ClearAll />}
                    onClick={() => clearAllRateLimitsMutation.mutate()}
                    disabled={clearAllRateLimitsMutation.isLoading}
                    fullWidth
                    sx={{ mt: 2 }}
                  >
                    {clearAllRateLimitsMutation.isLoading ? <CircularProgress size={24} /> : 'مسح جميع الحدود'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Grid>
        
        {/* رؤوس الأمان */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={2}>
              <Security />
              <Typography variant="h6">
                رؤوس الأمان
              </Typography>
            </Box>
            
            <List dense>
              {securityHeaders?.data?.map((header) => (
                <ListItem key={header.name}>
                  <ListItemText
                    primary={header.name}
                    secondary={header.value}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}