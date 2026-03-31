import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tabs,
  Tab,
  MenuItem,
  TextField,
  CircularProgress,
  Card,
  CardContent,
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
} from 'recharts';
import { analyticsService } from '../../api';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function Analytics() {
  const [tabValue, setTabValue] = useState(0);
  const [period, setPeriod] = useState('week');
  
  // تحليلات المستخدمين
  const { data: usersAnalytics, isLoading: usersLoading } = useQuery(
    ['users-analytics', period],
    () => analyticsService.getUsersAnalytics({ period }),
    { enabled: tabValue === 0 }
  );
  
  // تحليلات الطلبات
  const { data: ordersAnalytics, isLoading: ordersLoading } = useQuery(
    ['orders-analytics', period],
    () => analyticsService.getOrdersAnalytics({ period }),
    { enabled: tabValue === 1 }
  );
  
  // تحليلات الإيرادات
  const { data: revenueAnalytics, isLoading: revenueLoading } = useQuery(
    ['revenue-analytics', period],
    () => analyticsService.getRevenueAnalytics({ period }),
    { enabled: tabValue === 2 }
  );
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const periods = [
    { value: 'day', label: 'يوم' },
    { value: 'week', label: 'أسبوع' },
    { value: 'month', label: 'شهر' },
    { value: 'year', label: 'سنة' },
  ];
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" fontWeight="bold">
            التحليلات والتقارير
          </Typography>
          <TextField
            select
            label="الفترة"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            size="small"
            sx={{ width: 150 }}
          >
            {periods.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                {p.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab label="المستخدمين" />
          <Tab label="الطلبات" />
          <Tab label="الإيرادات" />
        </Tabs>
        
        {/* تحليلات المستخدمين */}
        {tabValue === 0 && (
          <Box>
            {usersLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {usersAnalytics?.data?.totalUsers?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2">إجمالي المستخدمين</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {usersAnalytics?.data?.newUsers?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2">مستخدمين جدد ({period})</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {usersAnalytics?.data?.activeUsers?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2">مستخدمين نشطين</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                      نمو المستخدمين
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={usersAnalytics?.data?.growth || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newUsers" stroke="#8884d8" name="مستخدمين جدد" />
                        <Line type="monotone" dataKey="totalUsers" stroke="#82ca9d" name="إجمالي المستخدمين" />
                      </LineChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                      توزيع المستخدمين حسب الدور
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={usersAnalytics?.data?.rolesDistribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(usersAnalytics?.data?.rolesDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {/* تحليلات الطلبات */}
        {tabValue === 1 && (
          <Box>
            {ordersLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {ordersAnalytics?.data?.totalOrders?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2">إجمالي الطلبات</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {ordersAnalytics?.data?.completedOrders?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2">طلبات مكتملة</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="error.main">
                        {ordersAnalytics?.data?.cancelledOrders?.toLocaleString() || 0}
                      </Typography>
                      <Typography variant="body2">طلبات ملغية</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {ordersAnalytics?.data?.averageOrderValue?.toLocaleString() || 0} ₪
                      </Typography>
                      <Typography variant="body2">متوسط قيمة الطلب</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                      اتجاه الطلبات
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={ordersAnalytics?.data?.dailyOrders || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="orders" fill="#8884d8" name="الطلبات" />
                        <Bar dataKey="completed" fill="#82ca9d" name="مكتملة" />
                        <Bar dataKey="cancelled" fill="#ff8042" name="ملغية" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
        
        {/* تحليلات الإيرادات */}
        {tabValue === 2 && (
          <Box>
            {revenueLoading ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="primary">
                        {revenueAnalytics?.data?.totalRevenue?.toLocaleString() || 0} ₪
                      </Typography>
                      <Typography variant="body2">إجمالي الإيرادات</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="success.main">
                        {revenueAnalytics?.data?.thisPeriodRevenue?.toLocaleString() || 0} ₪
                      </Typography>
                      <Typography variant="body2">إيرادات {period}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h4" color="warning.main">
                        {revenueAnalytics?.data?.growthRate || 0}%
                      </Typography>
                      <Typography variant="body2">نسبة النمو</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                      اتجاه الإيرادات
                    </Typography>
                    <ResponsiveContainer width="100%" height={400}>
                      <AreaChart data={revenueAnalytics?.data?.dailyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" name="الإيرادات" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                      الإيرادات حسب طريقة الدفع
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={revenueAnalytics?.data?.paymentMethodDistribution || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(revenueAnalytics?.data?.paymentMethodDistribution || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" mb={2}>
                      أفضل المتاجر من حيث الإيرادات
                    </Typography>
                    {revenueAnalytics?.data?.topStores?.slice(0, 5).map((store, index) => (
                      <Box key={store.id} display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">
                          {index + 1}. {store.name}
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {store.revenue?.toLocaleString()} ₪
                        </Typography>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}