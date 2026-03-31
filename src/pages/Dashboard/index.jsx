import { useQuery } from 'react-query';
import { Grid, Paper, Typography, Box, CircularProgress, Card, CardContent } from '@mui/material';
import { dashboardService } from '../../api';
import StatsCards from './components/StatsCards';
import OrdersChart from './components/OrdersChart';
import RevenueChart from './components/RevenueChart';
import RecentOrders from './components/RecentOrders';

export default function Dashboard() {
  const { data, isLoading, error } = useQuery(
    'dashboard',
    () => dashboardService.getDashboard(),
    {
      refetchInterval: 30000,
    }
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">حدث خطأ في تحميل البيانات: {error.message}</Typography>
      </Box>
    );
  }

  const dashboardData = data?.data || {};
console.log(data.data)
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        لوحة التحكم الرئيسية
      </Typography>
      
      {/* بطاقات الإحصائيات */}
      <StatsCards stats={dashboardData.stats || {}} />
      
      {/* الرسوم البيانية */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              تحليل الطلبات
            </Typography>
            <OrdersChart data={dashboardData.ordersAnalytics || []} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              الإيرادات
            </Typography>
            <RevenueChart data={dashboardData.revenueData || []} />
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              أحدث الطلبات
            </Typography>
            <RecentOrders orders={dashboardData.recentOrders || []} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}