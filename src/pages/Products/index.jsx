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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Edit,
  Delete,
  Visibility,
  Add,
  Refresh,
  Download,
  Inventory,
  ToggleOn,
  ToggleOff,
  Star,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { productsService, storesService } from '../../api';
import ProductForm from './components/ProductForm';
import ProductInventory from './components/ProductInventory';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function Products() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [storeFilter, setStoreFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openInventory, setOpenInventory] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب المنتجات
  const { data, isLoading, refetch } = useQuery(
    ['products', page, pageSize, search, categoryFilter, storeFilter, availabilityFilter],
    () => productsService.getProducts({
      page: page + 1,
      limit: pageSize,
      search: search || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      store: storeFilter !== 'all' ? storeFilter : undefined,
      isAvailable: availabilityFilter !== 'all' ? availabilityFilter === 'available' : undefined,
    }),
    {
      onSuccess: (response) => {
        console.log('✅ Products data received:', response);
      }
    }
  );
  
  // استخراج البيانات
  const products = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  
  // جلب المتاجر للفلتر
  const { data: storesData } = useQuery('stores-list', () => storesService.getStores({ limit: 100 }));
  
  // حذف منتج
  const deleteMutation = useMutation(
    (id) => productsService.deleteProduct(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setOpenDeleteDialog(false);
        setSnackbar({ open: true, message: 'تم حذف المنتج بنجاح', severity: 'success' });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل حذف المنتج',
          severity: 'error',
        });
      },
    }
  );
  
  // تغيير حالة التوفر
  const toggleAvailabilityMutation = useMutation(
    (id) => productsService.toggleAvailability(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setSnackbar({ open: true, message: 'تم تغيير حالة توفر المنتج', severity: 'success' });
      },
    }
  );
  
  // تمييز منتج
  const featureProductMutation = useMutation(
    ({ id, featured }) => productsService.featureProduct(id, { featured }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        setSnackbar({ open: true, message: 'تم تحديث حالة التمييز', severity: 'success' });
      },
    }
  );
  
  const columns = [
    {
      field: 'image',
      headerName: 'الصورة',
      width: 80,
      renderCell: (params) => (
        <Box
          component="img"
          src={params.value || '/placeholder-product.jpg'}
          alt={params.row.name}
          sx={{ width: 40, height: 40, borderRadius: 1, objectFit: 'cover' }}
        />
      ),
    },
    { field: 'name', headerName: 'اسم المنتج', width: 180 },
    {
      field: 'store',
      headerName: 'المتجر',
      width: 150,
      valueGetter: (params) => params.row.store?.name || params.row.storeId,
    },
    {
      field: 'price',
      headerName: 'السعر',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'discountedPrice',
      headerName: 'السعر بعد الخصم',
      width: 130,
      valueFormatter: (params) => params.value ? formatCurrency(params.value) : '-',
    },
    {
      field: 'category',
      headerName: 'التصنيف',
      width: 120,
    },
    {
      field: 'isAvailable',
      headerName: 'متاح',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'نعم' : 'لا'}
          size="small"
          color={params.value ? 'success' : 'error'}
        />
      ),
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
      field: 'featured',
      headerName: 'مميز',
      width: 80,
      renderCell: (params) => (
        params.value ? <Star color="warning" /> : null
      ),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" onClick={() => {
              setSelectedProduct(params.row);
              setOpenDetails(true);
            }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton size="small" onClick={() => {
              setSelectedProduct(params.row);
              setOpenForm(true);
            }}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="إدارة المخزون">
            <IconButton size="small" onClick={() => {
              setSelectedProduct(params.row);
              setOpenInventory(true);
            }}>
              <Inventory fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isAvailable ? 'تعطيل' : 'تفعيل'}>
            <IconButton size="small" onClick={() => toggleAvailabilityMutation.mutate(params.row._id)}>
              {params.row.isAvailable ? <ToggleOff fontSize="small" color="error" /> : <ToggleOn fontSize="small" color="success" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="تمييز">
            <IconButton
              size="small"
              onClick={() => featureProductMutation.mutate({ id: params.row._id, featured: !params.row.featured })}
              color={params.row.featured ? 'warning' : 'default'}
            >
              <Star fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton size="small" onClick={() => {
              setSelectedProduct(params.row);
              setOpenDeleteDialog(true);
            }} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];
  
  // إحصائيات المنتجات
  const { data: statsData } = useQuery('products-stats', () => productsService.getProductStats());
  
  const categories = [
    { value: 'all', label: 'الكل' },
    { value: 'main', label: 'وجبات رئيسية' },
    { value: 'appetizer', label: 'مقبلات' },
    { value: 'beverage', label: 'مشروبات' },
    { value: 'dessert', label: 'حلويات' },
    { value: 'salad', label: 'سلطات' },
  ];
  
  const stats = statsData?.data || {};
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      {/* بطاقات الإحصائيات */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {stats.total || 0}
            </Typography>
            <Typography variant="body2">إجمالي المنتجات</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {stats.available || 0}
            </Typography>
            <Typography variant="body2">منتجات متاحة</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {stats.lowStock || 0}
            </Typography>
            <Typography variant="body2">مخزون منخفض</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="secondary.main">
              {stats.featured || 0}
            </Typography>
            <Typography variant="body2">منتجات مميزة</Typography>
          </Paper>
        </Grid>
      </Grid>
      
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المنتجات
          </Typography>
          <Box display="flex" gap={2}>
            <Button variant="outlined" startIcon={<Refresh />} onClick={() => refetch()} size="small">
              تحديث
            </Button>
            <Button variant="outlined" startIcon={<Download />} size="small">
              تصدير
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedProduct(null);
                setOpenForm(true);
              }}
            >
              منتج جديد
            </Button>
          </Box>
        </Box>
        
        {/* فلاتر البحث */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="بحث"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="اسم المنتج..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
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
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="المتجر"
              size="small"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              {storesData?.data?.map((store) => (
                <MenuItem key={store._id} value={store._id}>
                  {store.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="الحالة"
              size="small"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
              <MenuItem value="all">الكل</MenuItem>
              <MenuItem value="available">متاح</MenuItem>
              <MenuItem value="unavailable">غير متاح</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setStoreFilter('all');
                setAvailabilityFilter('all');
              }}
            >
              مسح الفلترة
            </Button>
          </Grid>
        </Grid>
        
        {/* جدول المنتجات */}
        <DataGrid
          rows={products}
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
      
      {/* نموذج إضافة/تعديل منتج */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>{selectedProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}</DialogTitle>
        <DialogContent>
          <ProductForm
            product={selectedProduct}
            onSuccess={() => {
              setOpenForm(false);
              queryClient.invalidateQueries('products');
              setSnackbar({
                open: true,
                message: selectedProduct ? 'تم تحديث المنتج' : 'تم إضافة المنتج',
                severity: 'success',
              });
            }}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* تفاصيل المنتج */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل المنتج</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box
                    component="img"
                    src={selectedProduct.image || '/placeholder-product.jpg'}
                    alt={selectedProduct.name}
                    sx={{ width: '100%', borderRadius: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6">{selectedProduct.name}</Typography>
                  <Typography variant="body2" color="textSecondary" paragraph>
                    {selectedProduct.description}
                  </Typography>
                  <Box display="flex" gap={2} mb={1}>
                    <Typography variant="body2">
                      <strong>السعر:</strong> {formatCurrency(selectedProduct.price)}
                    </Typography>
                    {selectedProduct.discountedPrice && (
                      <Typography variant="body2" color="error">
                        <strong>بعد الخصم:</strong> {formatCurrency(selectedProduct.discountedPrice)}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" mb={1}>
                    <strong>التصنيف:</strong> {selectedProduct.category}
                  </Typography>
                  <Typography variant="body2" mb={1}>
                    <strong>وقت التحضير:</strong> {selectedProduct.preparationTime || 15} دقيقة
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <strong>التقييم:</strong>
                    <Rating value={selectedProduct.rating || 0} readOnly size="small" sx={{ ml: 1 }} />
                    <Typography variant="caption">({selectedProduct.rating || 0})</Typography>
                  </Box>
                  <Box display="flex" gap={1} mt={2}>
                    <Chip
                      label={selectedProduct.isAvailable ? 'متاح' : 'غير متاح'}
                      color={selectedProduct.isAvailable ? 'success' : 'error'}
                      size="small"
                    />
                    {selectedProduct.isVegetarian && <Chip label="نباتي" size="small" variant="outlined" />}
                    {selectedProduct.isVegan && <Chip label="فيجان" size="small" variant="outlined" />}
                    {selectedProduct.isGlutenFree && <Chip label="خالٍ من الجلوتين" size="small" variant="outlined" />}
                    {selectedProduct.featured && <Chip label="مميز" size="small" color="warning" />}
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
      
      {/* إدارة المخزون */}
      <Dialog open={openInventory} onClose={() => setOpenInventory(false)} maxWidth="sm" fullWidth>
        <DialogTitle>إدارة المخزون - {selectedProduct?.name}</DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <ProductInventory
              product={selectedProduct}
              onSuccess={() => {
                setOpenInventory(false);
                queryClient.invalidateQueries('products');
                setSnackbar({ open: true, message: 'تم تحديث المخزون', severity: 'success' });
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* حوار تأكيد الحذف */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>تأكيد الحذف</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من حذف المنتج "{selectedProduct?.name}"؟
            هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
          <Button onClick={() => deleteMutation.mutate(selectedProduct?._id)} color="error" variant="contained">
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