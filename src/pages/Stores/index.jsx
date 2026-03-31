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
  Card,
  CardContent,
  CardMedia,
  Grid,
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
  Verified,
  VerifiedUser,
  Storefront,
  Refresh,
  Add,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { storesService } from '../../api';
import StoreForm from './components/StoreForm';
import { formatDate } from '../../utils/formatters';

export default function Stores() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب المتاجر
const { data, isLoading, refetch } = useQuery(
  ['stores', page, pageSize, search, categoryFilter, statusFilter],
  () => storesService.getStores({
    page: page + 1,
    limit: pageSize,
    search: search || undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    isOpen: statusFilter !== 'all' ? statusFilter === 'open' : undefined,
  }),
  {
    onSuccess: (response) => {
      console.log('✅ Stores data received:', response);
      // ✅ البيانات تأتي في response.data مباشرة
      // response.data هي مصفوفة المتاجر
    },
    onError: (error) => {
      console.error('❌ Error fetching stores:', error);
      setSnackbar({
        open: true,
        message: 'فشل تحميل المتاجر',
        severity: 'error',
      });
    }
  }
);


  // استخراج البيانات
  const stores = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  const stats = data?.stats || {};
  // حذف متجر
  const deleteMutation = useMutation(
    (id) => storesService.deleteStore(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setOpenDeleteDialog(false);
        setSnackbar({ open: true, message: 'تم حذف المتجر بنجاح', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل حذف المتجر',
          severity: 'error',
        });
      },
    }
  );
  
  // توثيق متجر
  const verifyMutation = useMutation(
    (id) => storesService.verifyStore(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setSnackbar({ open: true, message: 'تم توثيق المتجر بنجاح', severity: 'success' });
      },
    }
  );
  
  // تغيير حالة المتجر
  const toggleStatusMutation = useMutation(
    (id) => storesService.toggleStoreStatus(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('stores');
        setSnackbar({ open: true, message: 'تم تغيير حالة المتجر', severity: 'success' });
      },
    }
  );
  
  const columns = [
    {
      field: 'logo',
      headerName: 'الشعار',
      width: 80,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.value || '/placeholder-store.jpg'}
          alt={params.row.name}
          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
        />
      ),
    },
    { field: 'name', headerName: 'اسم المتجر', width: 180 },
    { field: 'phone', headerName: 'رقم الهاتف', width: 150 },
    { field: 'email', headerName: 'البريد الإلكتروني', width: 180 },
    { field: 'category', headerName: 'التصنيف', width: 120 },
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
      field: 'isOpen',
      headerName: 'الحالة',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'مفتوح' : 'مغلق'}
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
            <IconButton size="small" onClick={() => {
              setSelectedStore(params.row);
              setOpenDetails(true);
            }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton size="small" onClick={() => {
              setSelectedStore(params.row);
              setOpenForm(true);
            }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          {!params.row.isVerified && (
            <Tooltip title="توثيق">
              <IconButton size="small" onClick={() => verifyMutation.mutate(params.row._id)} color="primary">
                <Verified fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={params.row.isOpen ? 'إغلاق' : 'فتح'}>
            <IconButton size="small" onClick={() => toggleStatusMutation.mutate(params.row._id)}>
              <Storefront fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton
              size="small"
              onClick={() => {
                setSelectedStore(params.row);
                setOpenDeleteDialog(true);
              }}
              color="error"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'restaurant', label: 'مطعم' },
    { value: 'cafe', label: 'مقهى' },
    { value: 'fast_food', label: 'وجبات سريعة' },
    { value: 'bakery', label: 'مخبز' },
    { value: 'grocery', label: 'بقالة' },
    { value: 'pharmacy', label: 'صيدلية' },
    { value: 'store', label: 'متجر' },
  ];
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المتاجر
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()} size="small">
              تحديث
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedStore(null);
                setOpenForm(true);
              }}
            >
              متجر جديد
            </Button>
          </Box>
        </Box>
        
        {/* فلاتر البحث */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="بحث"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اسم المتجر، البريد، رقم الهاتف..."
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              select
              label="التصنيف"
              size="small"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.value} value={cat.value}>
                  {cat.label}
                </MenuItem>
              ))}
            </TextField>
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
              <MenuItem value="open">مفتوح</MenuItem>
              <MenuItem value="closed">مغلق</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              مسح
            </Button>
          </Grid>
        </Grid>
        
        {/* جدول المتاجر */}
        <DataGrid
          rows={stores}
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
      
      {/* نموذج إضافة/تعديل متجر */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedStore ? 'تعديل متجر' : 'إضافة متجر جديد'}</DialogTitle>
        <DialogContent>
          <StoreForm
            store={selectedStore}
            onSuccess={() => {
              setOpenForm(false);
              queryClient.invalidateQueries('stores');
              setSnackbar({
                open: true,
                message: selectedStore ? 'تم تحديث المتجر' : 'تم إضافة المتجر',
                severity: 'success',
              });
            }}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* تفاصيل المتجر */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل المتجر</DialogTitle>
        <DialogContent>
          {selectedStore && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4} textAlign="center">
                  <Box
                    component="img"
                    src={selectedStore.logo || '/placeholder-store.jpg'}
                    alt={selectedStore.name}
                    sx={{ width: 120, height: 120, borderRadius: 2, objectFit: 'cover', mx: 'auto' }}
                  />
                  <Typography variant="h6" sx={{ mt: 2 }}>{selectedStore.name}</Typography>
                  <Box display="flex" justifyContent="center" mt={1}>
                    <Rating value={selectedStore.rating || 0} readOnly precision={0.5} />
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="body1" gutterBottom>
                    <strong>الوصف:</strong> {selectedStore.description || '-'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>التصنيف:</strong> {selectedStore.category}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>رقم الهاتف:</strong> {selectedStore.phone}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>البريد الإلكتروني:</strong> {selectedStore.email || '-'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>تاريخ التسجيل:</strong> {formatDate(selectedStore.createdAt)}
                  </Typography>
                  <Box display="flex" gap={1} mt={2}>
                    <Chip
                      label={selectedStore.isVerified ? 'موثق' : 'غير موثق'}
                      color={selectedStore.isVerified ? 'primary' : 'default'}
                    />
                    <Chip
                      label={selectedStore.isOpen ? 'مفتوح' : 'مغلق'}
                      color={selectedStore.isOpen ? 'success' : 'error'}
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
      
      {/* حوار تأكيد الحذف */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف المتجر "{selectedStore?.name}"؟
            هذا الإجراء لا يمكن التراجع عنه وسيؤدي إلى حذف جميع المنتجات المرتبطة به.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
          <Button onClick={() => deleteMutation.mutate(selectedStore?._id)} color="error" variant="contained">
            حذف
          </Button>
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