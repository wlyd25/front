import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { advancedStatsService } from '../../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdvancedStats() {
  const [tabValue, setTabValue] = useState(0);
  const [customParams, setCustomParams] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
    groupBy: 'day',
  });
  
  // إحصائيات يومية
  const { data: dailyStats, isLoading: dailyLoading } = useQuery(
    'daily-stats',
    () => advancedStatsService.getDailyStats(),
    { enabled: tabValue === 0 }
  );
  
  // إحصائيات أسبوعية
  const { data: weeklyStats, isLoading: weeklyLoading } = useQuery(
    'weekly-stats',
    () => advancedStatsService.getWeeklyStats(),
    { enabled: tabValue === 1 }
  );
  
  // إحصائيات شهرية
  const { data: monthlyStats, isLoading: monthlyLoading } = useQuery(
    'monthly-stats',
    () => advancedStatsService.getMonthlyStats(),
    { enabled: tabValue === 2 }
  );
  
  // إحصائيات مخصصة
  const { data: customStats, isLoading: customLoading, refetch: refetchCustom } = useQuery(
    ['custom-stats', customParams],
    () => advancedStatsService.getCustomStats(customParams),
    { enabled: tabValue === 3 }
  );
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleCustomSubmit = () => {
    refetchCustom();
  };
  
  const renderDailyStats = () => {
    if (dailyLoading) return <CircularProgress />;
    
    const stats = dailyStats?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalOrders || 0}</Typography>
                <Typography variant="body2">إجمالي الطلبات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {stats.completedOrders || 0}
                </Typography>
                <Typography variant="body2">طلبات مكتملة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {stats.activeUsers || 0}
                </Typography>
                <Typography variant="body2">مستخدمين نشطين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.newUsers || 0}</Typography>
                <Typography variant="body2">مستخدمين جدد</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                الطلبات حسب الساعة
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.hourlyOrders || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="orders" stroke="#8884d8" name="الطلبات" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                أكثر المنتجات مبيعاً
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.topProducts || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="quantity" fill="#82ca9d" name="الكمية" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderWeeklyStats = () => {
    if (weeklyLoading) return <CircularProgress />;
    
    const stats = weeklyStats?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalOrders || 0}</Typography>
                <Typography variant="body2">إجمالي الطلبات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalRevenue?.toLocaleString() || 0} ₪</Typography>
                <Typography variant="body2">إجمالي الإيرادات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {stats.growthRate || 0}%
                </Typography>
                <Typography variant="body2">نسبة النمو</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.avgOrderValue?.toLocaleString() || 0} ₪</Typography>
                <Typography variant="body2">متوسط قيمة الطلب</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                الطلبات والإيرادات خلال الأسبوع
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={stats.dailyData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" fill="#8884d8" name="الطلبات" />
                  <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" fill="#82ca9d" name="الإيرادات" />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderMonthlyStats = () => {
    if (monthlyLoading) return <CircularProgress />;
    
    const stats = monthlyStats?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalOrders || 0}</Typography>
                <Typography variant="body2">إجمالي الطلبات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalRevenue?.toLocaleString() || 0} ₪</Typography>
                <Typography variant="body2">إجمالي الإيرادات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {stats.monthlyGrowth || 0}%
                </Typography>
                <Typography variant="body2">نمو شهري</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.activeStores || 0}</Typography>
                <Typography variant="body2">متاجر نشطة</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                توزيع الطلبات حسب اليوم
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.ordersByDayOfWeek || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="orders" fill="#8884d8" name="الطلبات" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                توزيع الإيرادات حسب طريقة الدفع
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats.paymentMethodDistribution || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(stats.paymentMethodDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  const renderCustomStats = () => {
    if (customLoading) return <CircularProgress />;
    
    const stats = customStats?.data || {};
    
    return (
      <Box>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" mb={2}>
            الفترة المحددة
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="من تاريخ"
                value={customParams.from}
                onChange={(e) => setCustomParams({ ...customParams, from: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="date"
                label="إلى تاريخ"
                value={customParams.to}
                onChange={(e) => setCustomParams({ ...customParams, to: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                select
                label="التجميع حسب"
                value={customParams.groupBy}
                onChange={(e) => setCustomParams({ ...customParams, groupBy: e.target.value })}
              >
                <MenuItem value="hour">ساعة</MenuItem>
                <MenuItem value="day">يوم</MenuItem>
                <MenuItem value="week">أسبوع</MenuItem>
                <MenuItem value="month">شهر</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleCustomSubmit}
                sx={{ height: '100%' }}
              >
                تطبيق
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalOrders?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">إجمالي الطلبات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalRevenue?.toLocaleString() || 0} ₪</Typography>
                <Typography variant="body2">إجمالي الإيرادات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.totalUsers?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">إجمالي المستخدمين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{stats.avgOrderValue?.toLocaleString() || 0} ₪</Typography>
                <Typography variant="body2">متوسط قيمة الطلب</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" mb={2}>
                الاتجاهات خلال الفترة
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={stats.timelineData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="orders" stroke="#8884d8" name="الطلبات" />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#82ca9d" name="الإيرادات" />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  };
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" mb={3}>
          الإحصائيات المتقدمة
        </Typography>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="يومية" />
          <Tab label="أسبوعية" />
          <Tab label="شهرية" />
          <Tab label="مخصصة" />
        </Tabs>
        
        {tabValue === 0 && renderDailyStats()}
        {tabValue === 1 && renderWeeklyStats()}
        {tabValue === 2 && renderMonthlyStats()}
        {tabValue === 3 && renderCustomStats()}
      </Paper>
    </Box>
  );
}