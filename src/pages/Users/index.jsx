import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Button,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Alert,
  Snackbar,
  Grid,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  Refresh,
  Download,
  Person,
  AdminPanelSettings,
  Storefront,
  DeliveryDining,
  People,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { usersService } from '../../api';
import UserForm from './components/UserForm';
import UserDetails from './components/UserDetails';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/formatters';

// ألوان وأسماء الأدوار
const roleConfig = {
  admin: {
    name: 'مشرف',
    color: '#f44336',
    icon: AdminPanelSettings,
    bgColor: '#f4433620',
  },
  vendor: {
    name: 'تاجر',
    color: '#ff9800',
    icon: Storefront,
    bgColor: '#ff980020',
  },
  driver: {
    name: 'مندوب',
    color: '#2196f3',
    icon: DeliveryDining,
    bgColor: '#2196f320',
  },
  client: {
    name: 'عميل',
    color: '#4caf50',
    icon: People,
    bgColor: '#4caf5020',
  },
};

export default function Users() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [openDetails, setOpenDetails] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const debouncedSearch = useDebounce(search, 500);

  // جلب المستخدمين
  const { data, isLoading, refetch, isFetching } = useQuery(
    ['users', page, pageSize, debouncedSearch, roleFilter, statusFilter],
    () => usersService.getUsers({
      page: page + 1,
      limit: pageSize,
      search: debouncedSearch || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
      isActive: statusFilter !== 'all' ? statusFilter === 'active' : undefined,
    }),
    {
      onSuccess: (response) => {
        console.log('✅ Users data received:', response);
      },
      onError: (error) => {
        console.error('❌ Error fetching users:', error);
        setSnackbar({
          open: true,
          message: 'فشل تحميل المستخدمين',
          severity: 'error',
        });
      }
    }
  );

  // استخراج البيانات بالشكل الصحيح
  const users = data?.data || [];
  const pagination = data?.pagination || {};
  const totalCount = pagination?.total || 0;
  const stats = data?.stats || {};

  // حذف مستخدم
  const deleteMutation = useMutation(
    (id) => usersService.deleteUser(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setOpenDeleteDialog(false);
        setSnackbar({
          open: true,
          message: 'تم حذف المستخدم بنجاح',
          severity: 'success',
        });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل حذف المستخدم',
          severity: 'error',
        });
      },
    }
  );

  // تغيير حالة المستخدم
  const toggleStatusMutation = useMutation(
    ({ id, isActive }) => usersService.updateUser(id, { isActive: !isActive }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        setSnackbar({
          open: true,
          message: 'تم تغيير حالة المستخدم بنجاح',
          severity: 'success',
        });
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل تغيير حالة المستخدم',
          severity: 'error',
        });
      },
    }
  );

  // أعمدة الجدول
  const columns = [
    {
      field: 'name',
      headerName: 'الاسم',
      width: 180,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar
            src={params.row.image}
            sx={{ width: 32, height: 32 }}
          >
            {params.row.name?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="500">
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.email}
            </Typography>
          </Box>
          {params.row.isVerified && (
            <Tooltip title="موثق">
              <CheckCircle sx={{ fontSize: 14, color: '#4caf50' }} />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      field: 'phone',
      headerName: 'رقم الهاتف',
      width: 150,
      valueFormatter: (params) => params.value || 'غير محدد',
    },
    {
      field: 'role',
      headerName: 'الدور',
      width: 120,
      renderCell: (params) => {
        const config = roleConfig[params.value] || {
          name: params.value,
          color: '#9e9e9e',
          bgColor: '#9e9e9e20',
        };
        const Icon = config.icon || Person;
        return (
          <Chip
            icon={<Icon sx={{ fontSize: 16 }} />}
            label={config.name}
            size="small"
            sx={{
              backgroundColor: config.bgColor,
              color: config.color,
              fontWeight: 500,
            }}
          />
        );
      },
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
          variant="outlined"
        />
      ),
    },
    {
      field: 'isVerified',
      headerName: 'التوثيق',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'موثق' : 'غير موثق'}
          size="small"
          color={params.value ? 'primary' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'تاريخ التسجيل',
      width: 180,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'الإجراءات',
      width: 200,
      sortable: false,
      renderCell: (params) => (
        <Box display="flex" gap={0.5}>
          <Tooltip title="عرض التفاصيل">
            <IconButton size="small" onClick={() => handleViewDetails(params.row)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="تعديل">
            <IconButton size="small" onClick={() => handleEdit(params.row)}>
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={params.row.isActive ? 'تعطيل' : 'تفعيل'}>
            <IconButton size="small" onClick={() => handleToggleStatus(params.row)}>
              {params.row.isActive ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}
            </IconButton>
          </Tooltip>
          <Tooltip title="حذف">
            <IconButton size="small" onClick={() => handleDelete(params.row)} color="error">
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setOpenDetails(true);
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenForm(true);
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleToggleStatus = (user) => {
    toggleStatusMutation.mutate({ id: user._id, isActive: user.isActive });
  };

  const confirmDelete = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser._id);
    }
  };

  // حساب الإحصائيات
  const totalUsers = stats?.total || 0;
  const activeUsers = stats?.active || 0;
  const verifiedUsers = stats?.verified || 0;
  const byRole = stats?.byRole || [];

  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      {/* بطاقات الإحصائيات */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#1976d210', borderRight: '4px solid #1976d2' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    إجمالي المستخدمين
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {totalUsers}
                  </Typography>
                </Box>
                <People sx={{ fontSize: 48, color: '#1976d2', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#4caf5010', borderRight: '4px solid #4caf50' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    المستخدمين النشطين
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {activeUsers}
                  </Typography>
                </Box>
                <CheckCircle sx={{ fontSize: 48, color: '#4caf50', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ff980010', borderRight: '4px solid #ff9800' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    المستخدمين الموثقين
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {verifiedUsers}
                  </Typography>
                </Box>
                <AdminPanelSettings sx={{ fontSize: 48, color: '#ff9800', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#9c27b010', borderRight: '4px solid #9c27b0' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    الأدوار المتاحة
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="secondary.main">
                    {byRole.length}
                  </Typography>
                </Box>
                <Person sx={{ fontSize: 48, color: '#9c27b0', opacity: 0.5 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2 }}>
        {/* شريط العنوان والأزرار */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المستخدمين
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              size="small"
              disabled={isFetching}
            >
              تحديث
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              size="small"
            >
              تصدير
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setSelectedUser(null);
                setOpenForm(true);
              }}
            >
              مستخدم جديد
            </Button>
          </Box>
        </Box>

        {/* فلاتر البحث */}
        <Box display="flex" gap={2} mb={3} flexWrap="wrap">
          <TextField
            label="بحث"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 2, minWidth: 200 }}
            placeholder="بحث بالاسم أو البريد أو رقم الهاتف..."
            InputProps={{
              startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />,
            }}
          />
          <TextField
            select
            label="الدور"
            size="small"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">الكل</MenuItem>
            {Object.entries(roleConfig).map(([key, config]) => (
              <MenuItem key={key} value={key}>
                <Box display="flex" alignItems="center" gap={1}>
                  <config.icon fontSize="small" sx={{ color: config.color }} />
                  {config.name}
                </Box>
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="الحالة"
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="all">الكل</MenuItem>
            <MenuItem value="active">نشط</MenuItem>
            <MenuItem value="inactive">غير نشط</MenuItem>
          </TextField>
        </Box>

        {/* شريط إحصائيات الأدوار */}
        {byRole.length > 0 && (
          <Box display="flex" gap={1} mb={3} flexWrap="wrap" sx={{ borderTop: 1, borderBottom: 1, borderColor: 'divider', py: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2, alignSelf: 'center' }}>
              التوزيع حسب الدور:
            </Typography>
            {byRole.map((role) => {
              const config = roleConfig[role._id] || {
                name: role._id,
                color: '#9e9e9e',
                bgColor: '#9e9e9e20',
                icon: Person,
              };
              const Icon = config.icon;
              const isActive = roleFilter === role._id;
              return (
                <Chip
                  key={role._id}
                  icon={<Icon sx={{ fontSize: 16 }} />}
                  label={`${config.name}: ${role.count}`}
                  size="small"
                  onClick={() => setRoleFilter(isActive ? 'all' : role._id)}
                  sx={{
                    backgroundColor: isActive ? config.color : config.bgColor,
                    color: isActive ? '#fff' : config.color,
                    fontWeight: isActive ? 'bold' : 'normal',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: config.color,
                      color: '#fff',
                    },
                  }}
                />
              );
            })}
            {roleFilter !== 'all' && (
              <Chip
                label="إلغاء الفلتر"
                size="small"
                onClick={() => setRoleFilter('all')}
                sx={{ cursor: 'pointer' }}
                variant="outlined"
              />
            )}
          </Box>
        )}

        {/* جدول المستخدمين */}
        <DataGrid
          rows={users}
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
          localeText={{
            toolbarColumns: 'الأعمدة',
            toolbarFilters: 'فلترة',
            toolbarDensity: 'كثافة العرض',
            toolbarExport: 'تصدير',
            noRowsLabel: isLoading ? 'جاري التحميل...' : 'لا توجد بيانات',
            footerTotalRows: 'إجمالي الصفوف:',
          }}
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
          }}
        />
      </Paper>

      {/* نموذج إضافة/تعديل مستخدم */}
      <Dialog open={openForm} onClose={() => setOpenForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
        </DialogTitle>
        <DialogContent>
          <UserForm
            user={selectedUser}
            onSuccess={() => {
              setOpenForm(false);
              queryClient.invalidateQueries('users');
              setSnackbar({
                open: true,
                message: selectedUser ? 'تم تحديث المستخدم' : 'تم إضافة المستخدم',
                severity: 'success',
              });
            }}
            onCancel={() => setOpenForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* تفاصيل المستخدم */}
      <Dialog open={openDetails} onClose={() => setOpenDetails(false)} maxWidth="md" fullWidth>
        <DialogTitle>تفاصيل المستخدم</DialogTitle>
        <DialogContent dividers>
          {selectedUser && <UserDetails user={selectedUser} />}
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
            هل أنت متأكد من حذف المستخدم "{selectedUser?.name}"؟
            هذا الإجراء لا يمكن التراجع عنه.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>إلغاء</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            حذف
          </Button>
        </DialogActions>
      </Dialog>

      {/* إشعارات */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}