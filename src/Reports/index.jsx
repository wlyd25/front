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
  PictureAsPdf,
  TableChart,
  Assessment,
  TrendingUp,
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
  const { data: ordersReport, isLoading: ordersLoading, refetch: refetchOrders } = useQuery(
    ['orders-report', dateRange.from, dateRange.to, format],
    () => reportsService.getOrdersReport({ ...dateRange, format }),
    { enabled: tabValue === 0, keepPreviousData: true }
  );
  
  // تقارير المستخدمين
  const { data: usersReport, isLoading: usersLoading, refetch: refetchUsers } = useQuery(
    ['users-report', format],
    () => reportsService.getUsersReport({ format }),
    { enabled: tabValue === 1 }
  );
  
  // تقارير الإيرادات
  const { data: revenueReport, isLoading: revenueLoading, refetch: refetchRevenue } = useQuery(
    ['revenue-report', dateRange.from, dateRange.to],
    () => reportsService.getRevenueReport(dateRange),
    { enabled: tabValue === 2 }
  );
  
  // تقارير المندوبين
  const { data: driversReport, isLoading: driversLoading, refetch: refetchDrivers } = useQuery(
    ['drivers-report'],
    () => reportsService.getDriversReport(),
    { enabled: tabValue === 3 }
  );
  
  // تقارير المتاجر
  const { data: storesReport, isLoading: storesLoading, refetch: refetchStores } = useQuery(
    ['stores-report'],
    () => reportsService.getStoresReport(),
    { enabled: tabValue === 4 }
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
        data = revenueReport?.data?.revenue || [];
        filename = `revenue-report-${dateRange.from}_to_${dateRange.to}`;
        break;
      case 3:
        data = driversReport?.data?.drivers || [];
        filename = `drivers-report`;
        break;
      case 4:
        data = storesReport?.data?.stores || [];
        filename = `stores-report`;
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
        {/* إحصائيات سريعة */}
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
        
        {/* جدول الطلبات */}
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
                    <Chip
                      label={order.status}
                      size="small"
                      color={order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'error' : 'warning'}
                    />
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
                  <TableCell>
                    <Chip
                      label={user.role}
                      size="small"
                      color={user.role === 'admin' ? 'error' : user.role === 'vendor' ? 'warning' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isActive ? 'نشط' : 'غير نشط'}
                      size="small"
                      color={user.isActive ? 'success' : 'error'}
                    />
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
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{formatCurrency(reportData.projectedRevenue || 0)}</Typography>
                <Typography variant="body2">الإيرادات المتوقعة</Typography>
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
                <TableCell>متوسط قيمة الطلب</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.dailyRevenue?.map((day) => (
                <TableRow key={day.date}>
                  <TableCell>{formatDate(day.date, 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{day.orders}</TableCell>
                  <TableCell>{formatCurrency(day.revenue)}</TableCell>
                  <TableCell>{formatCurrency(day.averageOrderValue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  const renderDriversReport = () => {
    if (driversLoading) return <CircularProgress />;
    
    const reportData = driversReport?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{reportData.totalDrivers?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">إجمالي المندوبين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {reportData.activeDrivers?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">مندوبين نشطين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main">
                  {reportData.onlineDrivers?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">مندوبين متصلين</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{reportData.avgRating || 0}</Typography>
                <Typography variant="body2">متوسط التقييم</Typography>
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
                <TableCell>عدد التوصيلات</TableCell>
                <TableCell>التقييم</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.drivers?.map((driver) => (
                <TableRow key={driver.id}>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.phone}</TableCell>
                  <TableCell>{driver.totalDeliveries || 0}</TableCell>
                  <TableCell>{driver.rating || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={driver.isActive ? 'نشط' : 'غير نشط'}
                      size="small"
                      color={driver.isActive ? 'success' : 'error'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  const renderStoresReport = () => {
    if (storesLoading) return <CircularProgress />;
    
    const reportData = storesReport?.data || {};
    
    return (
      <Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{reportData.totalStores?.toLocaleString() || 0}</Typography>
                <Typography variant="body2">إجمالي المتاجر</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="success.main">
                  {reportData.activeStores?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">متاجر نشطة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4" color="primary.main">
                  {reportData.verifiedStores?.toLocaleString() || 0}
                </Typography>
                <Typography variant="body2">متاجر موثقة</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="h4">{reportData.avgRating || 0}</Typography>
                <Typography variant="body2">متوسط التقييم</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>اسم المتجر</TableCell>
                <TableCell>التصنيف</TableCell>
                <TableCell>عدد المنتجات</TableCell>
                <TableCell>عدد الطلبات</TableCell>
                <TableCell>التقييم</TableCell>
                <TableCell>الحالة</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reportData.stores?.map((store) => (
                <TableRow key={store.id}>
                  <TableCell>{store.name}</TableCell>
                  <TableCell>{store.category}</TableCell>
                  <TableCell>{store.productsCount || 0}</TableCell>
                  <TableCell>{store.ordersCount || 0}</TableCell>
                  <TableCell>{store.rating || 0}</TableCell>
                  <TableCell>
                    <Chip
                      label={store.isOpen ? 'مفتوح' : 'مغلق'}
                      size="small"
                      color={store.isOpen ? 'success' : 'error'}
                    />
                  </TableCell>
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
          <Typography variant="h5" fontWeight="bold">
            التقارير
          </Typography>
          <Box display="flex" gap={2}>
            <TextField
              select
              label="صيغة التصدير"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              size="small"
              sx={{ width: 120 }}
            >
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="csv">CSV</MenuItem>
            </TextField>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={handleExport}
            >
              تصدير التقرير
            </Button>
          </Box>
        </Box>
        
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<Assessment />} label="الطلبات" />
          <Tab icon={<TableChart />} label="المستخدمين" />
          <Tab icon={<TrendingUp />} label="الإيرادات" />
          <Tab icon={<Assessment />} label="المندوبين" />
          <Tab icon={<Assessment />} label="المتاجر" />
        </Tabs>
        
        {tabValue !== 2 && tabValue !== 1 && (
          <Box display="flex" gap={2} mb={3}>
            <TextField
              type="date"
              label="من تاريخ"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              type="date"
              label="إلى تاريخ"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="outlined"
              onClick={() => {
                if (tabValue === 0) refetchOrders();
                if (tabValue === 2) refetchRevenue();
              }}
            >
              تطبيق
            </Button>
          </Box>
        )}
        
        {tabValue === 0 && renderOrdersReport()}
        {tabValue === 1 && renderUsersReport()}
        {tabValue === 2 && renderRevenueReport()}
        {tabValue === 3 && renderDriversReport()}
        {tabValue === 4 && renderStoresReport()}
      </Paper>
    </Box>
  );
}