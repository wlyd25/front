// src/pages/Drivers/index.jsx - النسخة المعدلة بالكامل لتدعم الحالات الجديدة

import { useState, useCallback, useMemo } from 'react';
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
  Rating,
  Alert,
  Snackbar,
  Stack,
  Divider,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Verified,
  LocalShipping,
  Refresh,
  LocationOn,
  Block,
  CheckCircle,
  Wifi,
  WifiOff,
  Circle,
  DirectionsBike,
} from '@mui/icons-material';
import { driversService } from '../../api';
import ResponsiveTable from '../../components/Common/ResponsiveTable';
import ResponsiveStatsCards from '../../components/Common/ResponsiveStatsCards';
import ResponsiveFilters from '../../components/Common/ResponsiveFilters';
import ResponsiveDialog from '../../components/Common/ResponsiveDialog';
import { useResponsive } from '../../hooks/useResponsive';
import DriverDetails from './components/DriverDetails';
import DriverLocation from './components/DriverLocation';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { getReactKey, handleError } from '../../utils/helpers';

// ✅ أيقونات الحالة
const OnlineIcon = () => <Wifi fontSize="small" sx={{ color: '#4caf50' }} />;
const OfflineIcon = () => <WifiOff fontSize="small" sx={{ color: '#9e9e9e' }} />;
const AvailableIcon = () => <CheckCircle fontSize="small" sx={{ color: '#4caf50' }} />;
const UnavailableIcon = () => <Block fontSize="small" sx={{ color: '#ff9800' }} />;
const BusyIcon = () => <DirectionsBike fontSize="small" sx={{ color: '#ff9800' }} />;
const ActiveIcon = () => <Circle fontSize="small" sx={{ color: '#4caf50' }} />;
const InactiveIcon = () => <Circle fontSize="small" sx={{ color: '#f44336' }} />;

export default function Drivers() {
  const { isMobile, fontSize, spacing } = useResponsive();
  const queryClient = useQueryClient();
  
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(isMobile ? 10 : 20);
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',        // all, active, inactive
    online: 'all',        // all, online, offline
    availability: 'all',  // all, available, unavailable
    verified: 'all',      // all, verified, unverified
  });
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openLocation, setOpenLocation] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // ✅ جلب بيانات المندوبين مع الحالة التفصيلية من الـ API الجديد
  const { data, isLoading, refetch, isFetching } = useQuery(
    ['drivers', page, pageSize, filters],
    () => driversService.getDrivers({
      page: page + 1,
      limit: pageSize,
      search: filters.search || undefined,
      isActive: filters.status !== 'all' ? filters.status === 'active' : undefined,
      isOnline: filters.online !== 'all' ? filters.online === 'online' : undefined,
      isAvailable: filters.availability !== 'all' ? filters.availability === 'available' : undefined,
      isVerified: filters.verified !== 'all' ? filters.verified === 'verified' : undefined,
    }),
    {
      keepPreviousData: true,
      onError: (error) => {
        setSnackbar({ 
          open: true, 
          message: handleError(error, 'فشل تحميل بيانات المندوبين'), 
          severity: 'error' 
        });
      }
    }
  );

  const drivers = data?.data || [];
  const totalCount = data?.pagination?.total || 0;

  // ✅ تحديث حالة المندوب (تفعيل/تعطيل الحساب)
  const updateStatusMutation = useMutation(
    ({ driverId, isActive }) => driversService.updateDriverStatus(driverId, { isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        setSnackbar({ open: true, message: 'تم تغيير حالة المندوب', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({ open: true, message: handleError(error, 'فشل تغيير حالة المندوب'), severity: 'error' });
      },
    }
  );

  // ✅ توثيق المندوب
  const verifyMutation = useMutation(
    (driverId) => driversService.verifyDriver(driverId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        setSnackbar({ open: true, message: 'تم توثيق المندوب', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({ open: true, message: handleError(error, 'فشل توثيق المندوب'), severity: 'error' });
      },
    }
  );

  // ✅ فرض تحديث حالة التوفر (للاستخدام من قبل الأدمن)
  const forceUpdateAvailabilityMutation = useMutation(
    ({ driverId, isAvailable, reason }) => 
      driversService.forceUpdateAvailability(driverId, { isAvailable, reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('drivers');
        setSnackbar({ open: true, message: 'تم تحديث حالة المندوب', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({ open: true, message: handleError(error, 'فشل تحديث حالة المندوب'), severity: 'error' });
      },
    }
  );

  const handleViewDetails = useCallback((driver) => {
    setSelectedDriver(driver);
    setOpenDetails(true);
  }, []);

  const handleViewLocation = useCallback((driver) => {
    setSelectedDriver(driver);
    setOpenLocation(true);
  }, []);

  const handleToggleStatus = useCallback((driver) => {
    updateStatusMutation.mutate({ driverId: driver._id, isActive: !driver.isActive });
  }, [updateStatusMutation]);

  const handleVerify = useCallback((driver) => {
    verifyMutation.mutate(driver._id);
  }, [verifyMutation]);

  // ✅ فرض تغيير حالة التوفر
  const handleForceAvailability = useCallback((driver, isAvailable) => {
    forceUpdateAvailabilityMutation.mutate({ 
      driverId: driver._id, 
      isAvailable,
      reason: `تم التحديث بواسطة الأدمن - ${new Date().toLocaleString()}`
    });
  }, [forceUpdateAvailabilityMutation]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      online: 'all',
      availability: 'all',
      verified: 'all',
    });
    setPage(0);
  }, []);

  // ✅ حساب الإحصائيات
  const statsCards = useMemo(() => {
    const activeDrivers = drivers.filter(d => d.isActive === true).length;
    const onlineDrivers = drivers.filter(d => d.isOnline === true).length;
    const availableDrivers = drivers.filter(d => d.driverInfo?.isAvailable === true && d.isOnline === true).length;
    const verifiedDrivers = drivers.filter(d => d.isVerified === true).length;
    const busyDrivers = drivers.filter(d => d.currentOrder !== null && d.currentOrder !== undefined).length;
    
    return [
      { title: 'إجمالي المندوبين', value: totalCount, icon: LocalShipping, color: '#2196f3' },
      { title: 'مندوبين نشطين', value: activeDrivers, icon: ActiveIcon, color: '#4caf50' },
      { title: 'متصلون الآن', value: onlineDrivers, icon: OnlineIcon, color: '#2196f3' },
      { title: 'متاحون للطلبات', value: availableDrivers, icon: AvailableIcon, color: '#4caf50' },
      { title: 'مشغولون', value: busyDrivers, icon: BusyIcon, color: '#ff9800' },
      { title: 'مندوبين موثقين', value: verifiedDrivers, icon: Verified, color: '#9c27b0' },
    ];
  }, [drivers, totalCount]);

  // ✅ الحصول على لون حالة المندوب
  const getDriverStatusColor = useCallback((driver) => {
    const isActive = driver.isActive === true;
    const isOnline = driver.isOnline === true;
    const isAvailable = driver.driverInfo?.isAvailable === true;
    const hasActiveOrder = driver.currentOrder !== null && driver.currentOrder !== undefined;

    if (!isActive) return 'error';
    if (!isOnline) return 'warning';
    if (hasActiveOrder) return 'info';
    if (isAvailable) return 'success';
    return 'default';
  }, []);

  // ✅ الحصول على نص حالة المندوب
  const getDriverStatusLabel = useCallback((driver) => {
    const isActive = driver.isActive === true;
    const isOnline = driver.isOnline === true;
    const isAvailable = driver.driverInfo?.isAvailable === true;
    const hasActiveOrder = driver.currentOrder !== null && driver.currentOrder !== undefined;

    if (!isActive) return 'حساب معطل';
    if (!isOnline) return 'غير متصل';
    if (hasActiveOrder) return 'في توصيلة';
    if (isAvailable) return 'متاح للطلبات';
    return 'غير متاح';
  }, []);

  // ✅ أعمدة الجدول
  const columns = useMemo(() => [
    {
      field: 'avatar',
      headerName: '',
      width: 60,
      renderCell: (params) => (
        <Avatar src={params.row.image} sx={{ width: 40, height: 40 }}>
          {params.row.name?.charAt(0)}
        </Avatar>
      ),
    },
    { field: 'name', headerName: 'الاسم', width: 150 },
    { field: 'phone', headerName: 'رقم الهاتف', width: 130 },
    { field: 'email', headerName: 'البريد الإلكتروني', width: 200 },
    {
      field: 'rating',
      headerName: 'التقييم',
      width: 120,
      renderCell: (params) => (
        <Rating value={params.value || 0} readOnly size="small" precision={0.5} />
      ),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 130,
      renderCell: (params) => {
        const driver = params.row;
        const statusLabel = getDriverStatusLabel(driver);
        const statusColor = getDriverStatusColor(driver);
        let icon = null;
        
        if (driver.isOnline === true && driver.driverInfo?.isAvailable === true && !driver.currentOrder) {
          icon = <Wifi fontSize="small" sx={{ mr: 0.5 }} />;
        } else if (driver.isOnline === true && driver.currentOrder) {
          icon = <DirectionsBike fontSize="small" sx={{ mr: 0.5 }} />;
        } else if (driver.isOnline === true && !driver.driverInfo?.isAvailable) {
          icon = <Block fontSize="small" sx={{ mr: 0.5 }} />;
        } else if (!driver.isOnline) {
          icon = <WifiOff fontSize="small" sx={{ mr: 0.5 }} />;
        }
        
        return (
          <Chip 
            label={statusLabel} 
            size="small" 
            color={statusColor}
            icon={icon}
          />
        );
      },
    },
    {
      field: 'isVerified',
      headerName: 'توثيق',
      width: 80,
      renderCell: (params) => (
        params.value ? 
          <Verified fontSize="small" color="primary" /> : 
          <Block fontSize="small" color="disabled" />
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 250,
      hideOnDesktop: false,
      renderCell: (params) => {
        const driver = params.row;
        const isActive = driver.isActive === true;
        const isOnline = driver.isOnline === true;
        const isAvailable = driver.driverInfo?.isAvailable === true;
        const hasActiveOrder = driver.currentOrder !== null;
        
        return (
          <Box display="flex" gap={0.5}>
            <Tooltip title="عرض التفاصيل">
              <IconButton size="small" onClick={() => handleViewDetails(driver)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="الموقع الحالي">
              <IconButton size="small" onClick={() => handleViewLocation(driver)}>
                <LocationOn fontSize="small" />
              </IconButton>
            </Tooltip>
            {!driver.isVerified && (
              <Tooltip title="توثيق">
                <IconButton size="small" onClick={() => handleVerify(driver)} color="primary">
                  <Verified fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {/* ✅ زر فرض التغيير (للأدمن) - يظهر فقط للمندوبين المتصلين */}
            {isOnline && !hasActiveOrder && (
              <Tooltip title={isAvailable ? 'تعطيل الاستقبال' : 'تفعيل الاستقبال'}>
                <IconButton 
                  size="small" 
                  onClick={() => handleForceAvailability(driver, !isAvailable)}
                  color={isAvailable ? 'warning' : 'success'}
                >
                  {isAvailable ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title={isActive ? 'تعطيل الحساب' : 'تفعيل الحساب'}>
              <IconButton size="small" onClick={() => handleToggleStatus(driver)}>
                {isActive ? <Block fontSize="small" color="error" /> : <CheckCircle fontSize="small" color="success" />}
              </IconButton>
            </Tooltip>
          </Box>
        );
      },
    },
  ], [handleViewDetails, handleViewLocation, handleVerify, handleToggleStatus, handleForceAvailability, getDriverStatusLabel, getDriverStatusColor]);

  return (
    <Box sx={{ p: spacing.page }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: spacing.section, fontSize: fontSize.h2 }}>
        إدارة المندوبين
      </Typography>

      <ResponsiveStatsCards 
        cards={statsCards} 
        columnsDesktop={6} 
        columnsTablet={3} 
        columnsMobile={2} 
        spacing={spacing.section} 
      />

      <Paper sx={{ p: spacing.card }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: fontSize.h3 }}>
            قائمة المندوبين
          </Typography>
          <Button 
            variant="outlined" 
            startIcon={<Refresh />} 
            onClick={() => refetch()} 
            size="small" 
            disabled={isFetching}
          >
            تحديث
          </Button>
        </Box>

        <ResponsiveFilters onReset={resetFilters}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="بحث"
              size="small"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="الاسم، رقم الهاتف..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="حالة الحساب"
              size="small"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="inactive">غير نشط</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="حالة الاتصال"
              size="small"
              value={filters.online}
              onChange={(e) => setFilters({ ...filters, online: e.target.value })}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="online">متصل</MenuItem>
              <MenuItem value="offline">غير متصل</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="حالة الاستقبال"
              size="small"
              value={filters.availability}
              onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="available">متاح للطلبات</MenuItem>
              <MenuItem value="unavailable">غير متاح</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              select
              label="التوثيق"
              size="small"
              value={filters.verified}
              onChange={(e) => setFilters({ ...filters, verified: e.target.value })}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="verified">موثق</MenuItem>
              <MenuItem value="unverified">غير موثق</MenuItem>
            </TextField>
          </Grid>
        </ResponsiveFilters>

        <ResponsiveTable
          data={drivers}
          columns={columns}
          loading={isLoading}
          onRowClick={(driver) => {
            setSelectedDriver(driver);
            setOpenDetails(true);
          }}
          emptyMessage="لا يوجد مندوبين"
          renderMobileCard={(driver, index) => (
            <Paper 
              key={getReactKey(driver, index)} 
              sx={{ p: 1.5, cursor: 'pointer', mb: 1.5 }} 
              onClick={() => {
                setSelectedDriver(driver);
                setOpenDetails(true);
              }}
            >
              <Box display="flex" gap={2}>
                <Avatar src={driver.image} sx={{ width: 50, height: 50 }}>
                  {driver.name?.charAt(0)}
                </Avatar>
                <Box flex={1}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {driver.name}
                    </Typography>
                    <Chip 
                      label={getDriverStatusLabel(driver)} 
                      size="small" 
                      color={getDriverStatusColor(driver)} 
                    />
                  </Box>
                  <Typography variant="caption" color="textSecondary" display="block">
                    {driver.phone}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                    <Rating value={driver.rating || 0} readOnly size="small" />
                    {driver.isVerified && <Verified fontSize="small" color="primary" />}
                  </Box>
                </Box>
              </Box>
              <Divider sx={{ my: 1 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={0.5}>
                  <Chip 
                    size="small" 
                    label={driver.isOnline ? '🟢 متصل' : '⚫ غير متصل'} 
                    variant="outlined"
                  />
                  {driver.driverInfo?.isAvailable && (
                    <Chip size="small" label="✅ متاح" variant="outlined" color="success" />
                  )}
                  {driver.currentOrder && (
                    <Chip size="small" label="🚚 مشغول" variant="outlined" color="warning" />
                  )}
                </Box>
              </Box>
              <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                <IconButton 
                  size="small" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleViewLocation(driver);
                  }}
                >
                  <LocationOn fontSize="small" />
                </IconButton>
                {!driver.isVerified && (
                  <IconButton 
                    size="small" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleVerify(driver);
                    }}
                    color="primary"
                  >
                    <Verified fontSize="small" />
                  </IconButton>
                )}
                <IconButton 
                  size="small" 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleToggleStatus(driver);
                  }}
                >
                  {driver.isActive ? <Block fontSize="small" color="error" /> : <CheckCircle fontSize="small" color="success" />}
                </IconButton>
              </Box>
            </Paper>
          )}
        />
      </Paper>

      <ResponsiveDialog 
        open={openDetails} 
        onClose={() => setOpenDetails(false)} 
        title="تفاصيل المندوب" 
        maxWidth="md" 
        actions={<Button onClick={() => setOpenDetails(false)}>إغلاق</Button>}
      >
        {selectedDriver && <DriverDetails driver={selectedDriver} />}
      </ResponsiveDialog>

      <ResponsiveDialog 
        open={openLocation} 
        onClose={() => setOpenLocation(false)} 
        title={`موقع المندوب - ${selectedDriver?.name}`} 
        maxWidth="md" 
        actions={<Button onClick={() => setOpenLocation(false)}>إغلاق</Button>}
      >
        {selectedDriver && <DriverLocation driverId={selectedDriver._id} />}
      </ResponsiveDialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}