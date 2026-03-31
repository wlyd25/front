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
  Alert,
  Snackbar,
  Rating,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Refresh,
  Download,
  Verified,
  VerifiedUser,
  Block,
  CheckCircle,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { vendorsService } from '../../api';
import { formatDate } from '../../utils/formatters';

export default function Vendors() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب التجار
  const { data, isLoading, refetch } = useQuery(
    ['vendors', page, pageSize, search, statusFilter],
    () => vendorsService.getVendors({
      page: page + 1,
      limit: pageSize,
      search: search || undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    }),
    {
      onSuccess: (response) => {
        console.log('✅ Vendors data received:', response);
      }
    }
  );
  
  // استخراج البيانات بالشكل الصحيح
  const vendors = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  const stats = data?.stats || {};
  
  // توثيق تاجر
  const verifyMutation = useMutation(
    (id) => vendorsService.verifyVendor(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors');
        setSnackbar({ open: true, message: 'تم توثيق التاجر بنجاح', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل توثيق التاجر',
          severity: 'error',
        });
      },
    }
  );
  
  // تغيير حالة التاجر
  const updateStatusMutation = useMutation(
    ({ id, isActive }) => vendorsService.updateVendorStatus(id, { isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('vendors');
        setSnackbar({ open: true, message: 'تم تغيير حالة التاجر', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل تغيير الحالة',
          severity: 'error',
        });
      },
    }
  );
  
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
    { field: 'email', headerName: 'البريد الإلكتروني', width: 200 },
    {
      field: 'storeCount',
      headerName: 'عدد المتاجر',
      width: 120,
      valueGetter: (params) => params.row.stores?.length || 0,
    },
    {
      field: 'rating',
      headerName: 'التقييم',
      width: 120,
      renderCell: (params) => (
        <Box display="flex" alignItems="center">
          <Rating value={params.value || 0} readOnly size="small" precision={0.5} />
          <Typography variant="caption">({params.value || 0})</Typography>
        </Box>
      ),
    },
    {
      field: 'isVerified',
      headerName: 'موثق',
      width: 100,
      renderCell: (params) => (
        params.value ? (
          <Chip icon={<VerifiedUser />} label="موثق" size="small" color="primary" />
        ) : (
          <Chip label="غير موثق" size="small" variant="outlined" />
        )
      ),
    },
    {
      field: 'isActive',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'نشط' : 'غير نشط'}
          size="small"
          color={params.value ? 'success' : 'error'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ التسجيل',
      width: 150,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 180,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
              <Visibility fontSize="small" />
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
              {params.row.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  const handleViewDetails = (vendor) => {
    setSelectedVendor(vendor);
    setOpenDetails(true);
  };
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      {/* إحصائيات سريعة */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary">
                {totalCount}
              </Typography>
              <Typography variant="body2">إجمالي التجار</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {vendors.filter(v => v.isActive).length}
              </Typography>
              <Typography variant="body2">تجار نشطين</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main">
                {vendors.filter(v => v.isVerified).length}
              </Typography>
              <Typography variant="body2">تجار موثقين</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {vendors.filter(v => !v.isActive).length}
              </Typography>
              <Typography variant="body2">تجار غير نشطين</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            إدارة التجار
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
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="بحث"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="الاسم، رقم الهاتف، البريد الإلكتروني..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="الحالة"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="active">نشط</MenuItem>
              <MenuItem value="inactive">غير نشط</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
              }}
            >
              مسح
            </Button>
          </Grid>
        </Grid>
        
        {/* جدول التجار */}
        <DataGrid
          rows={vendors}
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
      
      {/* تفاصيل التاجر */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل التاجر</DialogTitle>
        <DialogContent>
          {selectedVendor && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} textAlign="center">
                  <Avatar
                    src={selectedVendor.avatar}
                    sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}
                  >
                    {selectedVendor.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">{selectedVendor.name}</Typography>
                  <Box display="flex" justifyContent="center" mt={1}>
                    <Rating value={selectedVendor.rating || 0} readOnly precision={0.5} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" gutterBottom>
                    <strong>رقم الهاتف:</strong> {selectedVendor.phone}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>البريد الإلكتروني:</strong> {selectedVendor.email || '-'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>عدد المتاجر:</strong> {selectedVendor.stores?.length || 0}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>تاريخ التسجيل:</strong> {formatDate(selectedVendor.createdAt)}
                  </Typography>
                  <Box display="flex" gap={1} mt={2}>
                    <Chip
                      label={selectedVendor.isVerified ? 'موثق' : 'غير موثق'}
                      color={selectedVendor.isVerified ? 'primary' : 'default'}
                    />
                    <Chip
                      label={selectedVendor.isActive ? 'نشط' : 'غير نشط'}
                      color={selectedVendor.isActive ? 'success' : 'error'}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>إغلاق</Button>
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