import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Grid,
  Card,
  CardContent,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  LinearProgress,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Refresh,
  Download,
  LocationOn,
  Verified,
  VerifiedUser,
  LocalShipping,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { driversService } from '../../api';
import DriverDetails from './components/DriverDetails';
import DriverLocation from './components/DriverLocation';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function Drivers() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب المندوبين
  const { data, isLoading, refetch } = useQuery(
    ['drivers', page, pageSize, search, statusFilter, availabilityFilter],
    () => driversService.getDrivers({
      page: page + 1,
      limit: pageSize,
      search: search || undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
      isOnline: availabilityFilter !== 'all' ? availabilityFilter === 'online' : undefined,
    }),
    {
      onSuccess: (response) => {
        console.log('✅ Drivers data received:', response);
      }
    }
  );
  
  // استخراج البيانات
  const drivers = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  
  // تغيير حالة المندوب
  const updateStatusMutation = useMutation(
    ({ id, isActive }) => driversService.updateDriverStatus(id, { isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        setSnackbar({ open: true, message: 'تم تغيير حالة المندوب', severity: 'success' });
      },
    }
  );
  
  // توثيق مندوب
  const verifyMutation = useMutation(
    (id) => driversService.verifyDriver(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        setSnackbar({ open: true, message: 'تم توثيق المندوب', severity: 'success' });
      },
    }
  );
  
  // إحصائيات
  const activeDrivers = drivers.filter(d => d.isActive).length;
  const onlineDrivers = drivers.filter(d => d.isOnline).length;
  const verifiedDrivers = drivers.filter(d => d.isVerified).length;
  
  const columns = [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.value} sx={{ width: 40, height: 40 }}>
          {params.row.name?.charAt(0)}
        </Avatar>
      ),
    },
    { field: 'name', headerName: 'الاسم', width: 150 },
    { field: 'phone', headerName: 'رقم الهاتف', width: 150 },
    { field: 'email', headerName: 'البريد الإلكتروني', width: 180 },
    {
      field: 'rating',
      headerName: 'التقييم',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Rating value={params.value || 0} readOnly size="small" precision={0.5} />
          <Typography variant="caption">({params.value || 0})</Typography>
        </Box>
      ),
    },
    {
      field: 'totalDeliveries',
      headerName: 'عدد التوصيلات',
      width: 120,
      valueGetter: (params) => params.row.stats?.totalDeliveries || 0,
    },
    {
      field: 'isOnline',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'متصل' : 'غير متصل'}
          size="small"
          color={params.value ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'isActive',
      headerName: 'نشط',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'نشط' : 'غير نشط'}
          size="small"
          color={params.value ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'isVerified',
      headerName: 'موثق',
      width: 80,
      renderCell: (params) => (
        params.value ? <VerifiedUser color="primary" /> : <Chip label="غير موثق" size="small" />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" onClick={() => {
              setSelectedDriver(params.row);
              setOpenDetails(true);
            }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="الموقع الحالي">
            <IconButton size="small" onClick={() => {
              setSelectedDriver(params.row);
              setOpenLocation(true);
            }}>
              <LocationOn fontSize="small" />
            </IconButton>
          </Tooltip>
          {!params.row.isVerified && (
            <Tooltip title="توثيق">
              <IconButton size="small" onClick={() => verifyMutation.mutate(params.row._id)} color="primary">
                <Verified fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={params.row.isActive ? 'تعطيل' : 'تفعيل'}>
            <IconButton
              size="small"
              onClick={() => updateStatusMutation.mutate({ id: params.row._id, isActive: !params.row.isActive })}
              color={params.row.isActive ? 'error' : 'success'}
            >
              {params.row.isActive ? <Delete fontSize="small" /> : <Verified fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      {/* بطاقات الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalCount}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                إجمالي المندوبين
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {onlineDrivers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                متصلون الآن
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {activeDrivers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                مندوبين نشطين
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card className="stats-card">
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {verifiedDrivers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                مندوبين موثقين
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المندوبين
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()} size="small">
              تحديث
            </Button>
            <Button variant="outlined" startIcon={<Download />} size="small">
              تصدير
            </Button>
          </Box>
        </Box>
        
        {/* فلاتر البحث */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="بحث"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="الاسم، رقم الهاتف..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="حالة الحساب"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="inactive">غير نشط</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="حالة الاتصال"
              size="small"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="online">متصل</MenuItem>
              <MenuItem value="offline">غير متصل</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setAvailabilityFilter('all');
              }}
            >
              مسح
            </Button>
          </Grid>
        </Grid>
        
        {/* جدول المندوبين */}
        <DataGrid
          rows={drivers}
          columns={columns}
          loading={isLoading}
          rowCount={totalCount}
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage) => setPage(newPage)}
          onPageSizeChange={(newSize) => setPageSize(newSize)}
          rowsPerPageOptions={[10, 20, 50, 100]}
          autoHeight
          disableSelectionOnClick
          getRowId={(row) => row._id}
        />
      </Paper>
      
      {/* تفاصيل المندوب */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل المندوب</DialogTitle>
        <DialogContent>
          {selectedDriver && <DriverDetails driver={selectedDriver} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      
      {/* موقع المندوب */}
      <Dialog open={openLocation} onClose={() => setOpenLocation(false)} maxWidth="md" fullWidth>
        <DialogTitle>موقع المندوب - {selectedDriver?.name}</DialogTitle>
        <DialogContent>
          {selectedDriver && <DriverLocation driverId={selectedDriver._id} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLocation(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      
      {/* إشعارات */}
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