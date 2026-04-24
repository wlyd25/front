// src/pages/admin/Dashboard/index.jsx

import { useQueries } from 'react-query';
import { 
  Grid, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert,
  useTheme, 
  useMediaQuery 
} from '@mui/material';
import { dashboardService, ordersService, productsService } from '../../api';
import StatsCards from './components/StatsCards';
import OrdersChart from './components/OrdersChart';
import RevenueChart from './components/RevenueChart';
import RecentOrders from './components/RecentOrders';
import UsersByRole from './components/UsersByRole';

// دالة مساعدة لحساب نسبة النمو
const calculateGrowthRate = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// دالة لتجميع بيانات الطلبات اليومية
const processDailyOrdersData = (dailyStats = []) => {
  return dailyStats.map(day => ({
    date: day._id || day.date,
    orders: day.orders || day.count || 0,
    completed: day.completed || 0,
    cancelled: day.cancelled || 0,
    revenue: day.revenue || 0,
  }));
};

export default function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  // استدعاء متعدد للـ APIs
  const results = useQueries([
    { 
      queryKey: 'dashboard', 
      queryFn: () => dashboardService.getDashboard(),
      refetchInterval: 30000,
      staleTime: 10000,
    },
    { 
      queryKey: 'dailyOrders', 
      queryFn: () => ordersService.getOrdersStatsDaily(),
      refetchInterval: 60000,
      staleTime: 30000,
    },
    { 
      queryKey: 'productStats', 
      queryFn: () => productsService.getProductStats(),
      refetchInterval: 300000, // 5 دقائق
      staleTime: 120000,
    },
    { 
      queryKey: 'usersByRole', 
      queryFn: () => dashboardService.getStatsUsers(),
      refetchInterval: 300000,
      staleTime: 120000,
    },
  ]);

  const [dashboardQuery, dailyOrdersQuery, productsQuery, usersByRoleQuery] = results;

  const isLoading = dashboardQuery.isLoading || dailyOrdersQuery.isLoading;
  const hasError = dashboardQuery.isError || dailyOrdersQuery.isError || productsQuery.isError;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (hasError) {
    const errorMessage = dashboardQuery.error?.message || 
                        dailyOrdersQuery.error?.message || 
                        'حدث خطأ في تحميل البيانات';
    return (
      <Box p={isMobile ? 2 : 3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {errorMessage}
        </Alert>
      </Box>
    );
  }

  // استخراج البيانات من الاستجابات
  const dashboardData = dashboardQuery.data?.data || {};
  const dailyOrdersData = dailyOrdersQuery.data?.data || {};
  const productStats = productsQuery.data?.data || {};
  const usersByRoleData = usersByRoleQuery.data?.data || [];

  // ✅ تجميع الإحصائيات بشكل صحيح
  const stats = {
    // من dashboard
    totalUsers: dashboardData.stats?.totalUsers || 0,
    totalStores: dashboardData.stats?.totalStores || 0,
    totalDrivers: dashboardData.stats?.totalDrivers || 0,
    revenueToday: dashboardData.stats?.revenueToday || 0,
    pendingOrders: dashboardData.stats?.pendingOrders || 0,
    
    // من productStats
    totalProducts: productStats.totalProducts || productStats.total || 0,
    activeProducts: productStats.availableProducts || productStats.active || 0,
    
    // من dailyOrders
    todayOrders: dailyOrdersData.totalOrders || 0,
    todayRevenue: dailyOrdersData.totalRevenue || 0,
    
    // قيم محسوبة
    avgDailyOrders: Math.round((dashboardData.stats?.totalOrders || 0) / 30) || 0,
    onlineDrivers: dashboardData.stats?.onlineDrivers || 0,
    
    // نسبة النمو (محسوبة)
    growthRate: calculateGrowthRate(
      dashboardData.stats?.totalUsers || 0,
      (dashboardData.stats?.totalUsers || 0) - (dashboardData.stats?.newUsersThisMonth || 0)
    ),
  };

  // ✅ معالجة بيانات الطلبات للرسم البياني
  const ordersAnalytics = processDailyOrdersData(dailyOrdersData.daily || []);

  // ✅ معالجة بيانات الإيرادات للرسم البياني
  const revenueData = (dailyOrdersData.daily || []).map(day => ({
    date: day._id || day.date,
    revenue: day.revenue || 0,
  }));

  // ✅ أحدث الطلبات
  const recentOrders = dashboardData.recentOrders || [];

  return (
    <Box 
      dir="rtl" 
      sx={{ 
        p: { xs: 1.5, sm: 2, md: 3 },
        width: '100%',
        overflowX: 'hidden',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        sx={{ 
          mb: { xs: 2, sm: 3 }, 
          fontWeight: 'bold',
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
        }}
      >
        لوحة التحكم الرئيسية
      </Typography>
      
      {/* بطاقات الإحصائيات */}
      <StatsCards stats={stats} />
      
      {/* الرسوم البيانية */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mt: { xs: 0, sm: 1 } }}>
        <Grid item xs={12} md={8}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, fontWeight: 'medium' }}>
              تحليل الطلبات
            </Typography>
            <OrdersChart data={ordersAnalytics} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, fontWeight: 'medium' }}>
              الإيرادات
            </Typography>
            <RevenueChart data={revenueData} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              height: '100%',
            }}
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, fontWeight: 'medium' }}>
              توزيع المستخدمين حسب الدور
            </Typography>
            <UsersByRole data={usersByRoleData} />
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              height: '100%',
            }}
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, fontWeight: 'medium' }}>
              أفضل المتاجر
            </Typography>
            {/* يمكن إضافة مكون TopStores هنا إذا كان متاحاً */}
            <Typography color="textSecondary" align="center" sx={{ py: 4 }}>
              قيد التطوير
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Paper 
            sx={{ 
              p: { xs: 1.5, sm: 2 }, 
              borderRadius: 2,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              overflowX: 'auto',
            }}
          >
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mb: 2, fontWeight: 'medium' }}>
              أحدث الطلبات
            </Typography>
            <RecentOrders orders={recentOrders} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}