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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Grid,
} from '@mui/material';
import {
  Visibility,
  LocalShipping,
  Cancel,
  Refresh,
  Download,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ordersService } from '../../api';
import OrderDetails from './components/OrderDetails';
import AssignDriverModal from './components/AssignDriverModal';
import { formatDate, formatCurrency } from '../../utils/formatters';

const statusColors = {
  pending: { label: 'قيد الانتظار', color: '#ff9800' },
  accepted: { label: 'تم القبول', color: '#2196f3' },
  ready: { label: 'جاهز', color: '#4caf50' },
  picked: { label: 'تم الاستلام', color: '#9c27b0' },
  delivered: { label: 'تم التوصيل', color: '#4caf50' },
  cancelled: { label: 'ملغي', color: '#f44336' },
};

const statusOptions = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'قيد الانتظار' },
  { value: 'accepted', label: 'تم القبول' },
  { value: 'ready', label: 'جاهز' },
  { value: 'picked', label: 'تم الاستلام' },
  { value: 'delivered', label: 'تم التوصيل' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function Orders() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [openAssignDriver, setOpenAssignDriver] = useState(false);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب الطلبات
  const { data, isLoading, refetch } = useQuery(
    ['orders', page, pageSize, statusFilter, search, dateFrom, dateTo],
    () => ordersService.getOrders({
      page: page + 1,
      limit: pageSize,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: search || undefined,
      fromDate: dateFrom || undefined,
      toDate: dateTo || undefined,
    }),
    {
      onSuccess: (response) => {
        console.log('✅ Orders data received:', response);
      }
    }
  );
  
  // استخراج البيانات
  const orders = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  
  // إلغاء طلب
  const cancelMutation = useMutation(
    ({ id, reason }) => ordersService.forceCancelOrder(id, { reason }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        setOpenCancelDialog(false);
        setCancelReason('');
        setSnackbar({
          open: true,
          message: 'تم إلغاء الطلب بنجاح',
          severity: 'success',
        });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل إلغاء الطلب',
          severity: 'error',
        });
      },
    }
  );
  
  const columns = [
    { field: '_id', headerName: 'رقم الطلب', width: 220 },
    {
      field: 'user',
      headerName: 'العميل',
      width: 150,
      valueGetter: (params) => params.row.user?.name || params.row.userId,
    },
    {
      field: 'store',
      headerName: 'المتجر',
      width: 150,
      valueGetter: (params) => params.row.store?.name || params.row.storeId,
    },
    {
      field: 'totalPrice',
      headerName: 'الإجمالي',
      width: 120,
      valueFormatter: (params) => formatCurrency(params.value),
    },
    {
      field: 'status',
      headerName: 'الحالة',
      width: 120,
      renderCell: (params) => {
        const status = statusColors[params.value] || { label: params.value, color: '#999' };
        return (
          <Chip
            label={status.label}
            size="small"
            sx={{ backgroundColor: `${status.color}20`, color: status.color }}
          />
        );
      },
    },
    {
      field: 'paymentStatus',
      headerName: 'حالة الدفع',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value === 'paid' ? 'مدفوع' : params.value === 'pending' ? 'قيد الانتظار' : 'فشل'}
          size="small"
          color={params.value === 'paid' ? 'success' : params.value === 'pending' ? 'warning' : 'error'}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ الطلب',
      width: 150,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" onClick={() => {
              setSelectedOrder(params.row);
              setOpenDetails(true);
            }}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status !== 'delivered' && params.row.status !== 'cancelled' && (
            <>
              <Tooltip title="تعيين مندوب">
                <IconButton size="small" onClick={() => {
                  setSelectedOrder(params.row);
                  setOpenAssignDriver(true);
                }}>
                  <LocalShipping fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="إلغاء الطلب">
                <IconButton size="small" onClick={() => {
                  setSelectedOrder(params.row);
                  setOpenCancelDialog(true);
                }} color="error">
                  <Cancel fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      ),
    },
  ];
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            إدارة الطلبات
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
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="بحث"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="رقم الطلب، العميل، المتجر..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="الحالة"
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="من تاريخ"
              size="small"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="date"
              label="إلى تاريخ"
              size="small"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setDateFrom('');
                setDateTo('');
              }}
            >
              مسح الفلترة
            </Button>
          </Grid>
        </Grid>
        
        {/* جدول الطلبات */}
        <DataGrid
          rows={orders}
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
      
      {/* تفاصيل الطلب */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل الطلب #{selectedOrder?._id}</DialogTitle>
        <DialogContent>
          {selectedOrder && <OrderDetails order={selectedOrder} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetails(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
      
      {/* تعيين مندوب */}
      <AssignDriverModal
        open={openAssignDriver}
        onClose={() => setOpenAssignDriver(false)}
        orderId={selectedOrder?._id}
        onSuccess={() => {
          setOpenAssignDriver(false);
          queryClient.invalidateQueries('orders');
          setSnackbar({
            open: true,
            message: 'تم تعيين المندوب بنجاح',
            severity: 'success',
          });
        }}
      />
      
      {/* إلغاء الطلب */}
      <Dialog open={openCancelDialog} onClose={() => setOpenCancelDialog(false)}>
        <DialogTitle>إلغاء الطلب</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="سبب الإلغاء"
            multiline
            rows={3}
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="يرجى توضيح سبب إلغاء الطلب..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCancelDialog(false)}>إلغاء</Button>
          <Button
            onClick={() => cancelMutation.mutate({ id: selectedOrder?._id, reason: cancelReason })}
            color="error"
            variant="contained"
            disabled={!cancelReason.trim() || cancelMutation.isLoading}
          >
            {cancelMutation.isLoading ? 'جاري الإلغاء...' : 'تأكيد الإلغاء'}
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