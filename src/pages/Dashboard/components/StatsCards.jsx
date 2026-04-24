// src/pages/admin/Dashboard/components/StatsCards.jsx

import { Grid, Card, CardContent, Typography, Box, useTheme, useMediaQuery, Skeleton } from '@mui/material';
import { 
  PeopleAlt, 
  Storefront, 
  ShoppingBag, 
  AttachMoney, 
  Restaurant, 
  LocalShipping, 
  TrendingUp, 
  Assessment,
  PendingActions,
  OnlinePrediction,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color, subtext, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Skeleton variant="rectangular" height={80} />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box sx={{ textAlign: 'right' }}>
            <Typography 
              color="textSecondary" 
              variant={isMobile ? "caption" : "body2"}
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              {title}
            </Typography>
            <Typography 
              variant={isMobile ? "h5" : "h4"} 
              sx={{ 
                mt: 1, 
                fontWeight: 'bold',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' }
              }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
            </Typography>
            {subtext && (
              <Typography 
                variant="caption" 
                color="textSecondary"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  display: 'block',
                  mt: 0.5
                }}
              >
                {subtext}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}15`,
              borderRadius: 2,
              p: { xs: 1, sm: 1.5 },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon sx={{ color, fontSize: { xs: 28, sm: 32 } }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default function StatsCards({ stats = {}, loading = false }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ✅ تعريف البطاقات مع معالجة القيم المفقودة
  const cards = [
    { 
      title: 'إجمالي المستخدمين', 
      value: stats.totalUsers || 0, 
      icon: PeopleAlt, 
      color: '#2196f3', 
      subtext: `نشط ${stats.activeUsers || 0}` 
    },
    { 
      title: 'المتاجر', 
      value: stats.totalStores || 0, 
      icon: Storefront, 
      color: '#4caf50', 
      subtext: `${stats.activeStores || 0} نشط` 
    },
    { 
      title: 'المنتجات', 
      value: stats.totalProducts || 0, 
      icon: Restaurant, 
      color: '#ff9800', 
      subtext: `${stats.activeProducts || 0} متاح` 
    },
    { 
      title: 'الطلبات اليوم', 
      value: stats.todayOrders || 0, 
      icon: ShoppingBag, 
      color: '#9c27b0', 
      subtext: `متوسط ${stats.avgDailyOrders || 0} / يوم` 
    },
    { 
      title: 'المندوبين', 
      value: stats.totalDrivers || 0, 
      icon: LocalShipping, 
      color: '#00bcd4', 
      subtext: `${stats.onlineDrivers || 0} متصل` 
    },
    { 
      title: 'الإيرادات اليوم', 
      value: `${(stats.revenueToday || 0).toLocaleString()} ₪`, 
      icon: AttachMoney, 
      color: '#f44336', 
      subtext: `إجمالي ${(stats.totalRevenue || 0).toLocaleString()} ₪` 
    },
    { 
      title: 'طلبات معلقة', 
      value: stats.pendingOrders || 0, 
      icon: PendingActions, 
      color: '#ff6b35', 
      subtext: 'بحاجة إلى معالجة' 
    },
    { 
      title: 'نسبة النمو', 
      value: `${stats.growthRate?.toFixed(1) || 0}%`, 
      icon: TrendingUp, 
      color: '#3f51b5', 
      subtext: 'مقارنة بالشهر الماضي' 
    },
  ];
  
  return (
    <Grid container spacing={isMobile ? 1.5 : 3}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={6} md={3} key={index}>
          <StatCard {...card} loading={loading} />
        </Grid>
      ))}
    </Grid>
  );
}