import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Download,
  Assessment,
  TrendingUp,
  TableChart,
} from '@mui/icons-material';
import { reportsService } from '../../api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportToCSV, exportToJSON } from '../../utils/exportHelpers';

export default function Reports() {
  const [tabValue, setTabValue] = useState(0);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [format, setFormat] = useState('json');
  
  // تقارير الطلبات
  const { data: ordersReport, isLoading: ordersLoading } = useQuery(
    ['orders-report', dateRange.from, dateRange.to],
    () => reportsService.getOrdersReport({ ...dateRange, format }),
    { enabled: tabValue === 0 }
  );
  
  // تقارير المستخدمين
  const { data: usersReport, isLoading: usersLoading } = useQuery(
    ['users-report'],
    () => reportsService.getUsersReport({ format }),
    { enabled: tabValue === 1 }
  );
  
  // تقارير الإيرادات
  const { data: revenueReport, isLoading: revenueLoading } = useQuery(
    ['revenue-report', dateRange.from, dateRange.to],
    () => reportsService.getRevenueReport(dateRange),
    { enabled: tabValue === 2 }
  );
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleExport = () => {
    let data = [];
    let filename = '';
    
    switch (tabValue) {
      case 0:
        data = ordersReport?.data?.orders || [];
        filename = `orders-report-${dateRange.from}_to_${dateRange.to}`;
        break;
      case 1:
        data = usersReport?.data?.users || [];
        filename = `users-report`;
        break;
      case 2:
        data = revenueReport?.data?.dailyRevenue || [];
        filename = `revenue-report-${dateRange.from}_to_${dateRange.to}`;
        break;
    }
    
    if (format === 'csv') {
      exportToCSV(data, `${filename}.csv`);
    } else {
      exportToJSON(data, `${filename}.json`);
    }
  };
  
  const renderOrdersReport = () => {
    if (ordersLoading) return <CircularProgress />;
    const reportData = ordersReport?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{reportData.totalOrders?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">إجمالي الطلبات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {reportData.completedOrders?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">طلبات مكتملة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="error.main">
                  {reportData.cancelledOrders?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">طلبات ملغية</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{formatCurrency(reportData.totalRevenue || 0)}</Typography>
                <Typography variant="body2">إجمالي الإيرادات</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>رقم الطلب</TableCell>
                <TableCell>العميل</TableCell>
                <TableCell>المتجر</TableCell>
                <TableCell>المبلغ</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ الطلب</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.orders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.user?.name || order.userId}</TableCell>
                  <TableCell>{order.store?.name || order.storeId}</TableCell>
                  <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
                  <TableCell>
                    <Chip label={order.status} size="small" />
                  </TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  const renderUsersReport = () => {
    if (usersLoading) return <CircularProgress />;
    const reportData = usersReport?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{reportData.totalUsers?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">إجمالي المستخدمين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {reportData.activeUsers?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">مستخدمين نشطين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main">
                  {reportData.verifiedUsers?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">مستخدمين موثقين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {reportData.newUsersThisMonth?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">مستخدمين جدد هذا الشهر</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>الاسم</TableCell>
                <TableCell>رقم الهاتف</TableCell>
                <TableCell>البريد الإلكتروني</TableCell>
                <TableCell>الدور</TableCell>
                <TableCell>الحالة</TableCell>
                <TableCell>تاريخ التسجيل</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.users?.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>{user.email || '-'}</TableCell>
                  <TableCell><Chip label={user.role} size="small" /></TableCell>
                  <TableCell>
                    <Chip label={user.isActive ? 'نشط' : 'غير نشط'} size="small" color={user.isActive ? 'success' : 'error'} />
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  const renderRevenueReport = () => {
    if (revenueLoading) return <CircularProgress />;
    const reportData = revenueReport?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{formatCurrency(reportData.totalRevenue || 0)}</Typography>
                <Typography variant="body2">إجمالي الإيرادات</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {formatCurrency(reportData.avgDailyRevenue || 0)}
                </Typography>
                <Typography variant="body2">متوسط الإيرادات اليومية</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="warning.main">
                  {reportData.growthRate || 0}%
                </Typography>
                <Typography variant="body2">نسبة النمو</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اليوم</TableCell>
                <TableCell>عدد الطلبات</TableCell>
                <TableCell>الإيرادات</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.dailyRevenue?.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{formatDate(day.date, 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{day.orders}</TableCell>
                  <TableCell>{formatCurrency(day.revenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">التقارير</Typography>
          <Box display="flex" gap={2}>
            <TextField select label="صيغة التصدير" value={format} onChange={(e) => setFormat(e.target.value)} size="small" sx={{ width: 120 }}>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
            <Button variant="contained" startIcon={<Download />} onClick={handleExport}>تصدير التقرير</Button>
          </Box>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<Assessment />} label="الطلبات" />
          <Tab icon={<TableChart />} label="المستخدمين" />
          <Tab icon={<TrendingUp />} label="الإيرادات" />
        </Tabs>
        
        {tabValue !== 1 && (
          <Box display="flex" gap={2} mb={3}>
            <TextField type="date" label="من تاريخ" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} size="small" InputLabelProps={{ shrink: true }} />
            <TextField type="date" label="إلى تاريخ" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} size="small" InputLabelProps={{ shrink: true }} />
          </Box>
        )}
        
        {tabValue === 0 && renderOrdersReport()}
        {tabValue === 1 && renderUsersReport()}
        {tabValue === 2 && renderRevenueReport()}
      </Paper>
    </Box>
  );
}