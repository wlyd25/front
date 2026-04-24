// src/pages/admin/Dashboard/components/RecentOrders.jsx

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Box,
  Typography,
  Card,
  Skeleton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Visibility } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const statusColors = {
  pending: 'warning',
  accepted: 'info',
  ready: 'primary',
  picked: 'secondary',
  delivered: 'success',
  cancelled: 'error',
};

const statusLabels = {
  pending: 'قيد الانتظار',
  accepted: 'مقبول',
  ready: 'جاهز',
  picked: 'تم الاستلام',
  delivered: 'تم التوصيل',
  cancelled: 'ملغي',
};

// مكون تحميل للهواتف
const MobileSkeleton = () => (
  <Card sx={{ p: 1.5 }}>
    <Skeleton variant="rectangular" height={80} />
  </Card>
);

// مكون تحميل للجدول
const TableSkeleton = () => (
  <TableRow>
    <TableCell><Skeleton variant="text" width={60} /></TableCell>
    <TableCell><Skeleton variant="text" width={100} /></TableCell>
    <TableCell><Skeleton variant="text" width={100} /></TableCell>
    <TableCell><Skeleton variant="text" width={60} /></TableCell>
    <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
    <TableCell><Skeleton variant="text" width={80} /></TableCell>
    <TableCell><Skeleton variant="circular" width={32} height={32} /></TableCell>
  </TableRow>
);

export default function RecentOrders({ orders = [], loading = false }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (loading) {
    if (isMobile) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3, 4, 5].map((i) => (
            <MobileSkeleton key={i} />
          ))}
        </Box>
      );
    }
    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>رقم الطلب</TableCell>
              <TableCell>العميل</TableCell>
              <TableCell>المتجر</TableCell>
              <TableCell>المبلغ</TableCell>
              <TableCell>الحالة</TableCell>
              <TableCell>التاريخ</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[1, 2, 3, 4, 5].map((i) => (
              <TableSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
  
  if (orders.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <Typography color="textSecondary">لا توجد طلبات حديثة</Typography>
      </Box>
    );
  }
  
  if (isMobile) {
    // عرض بطاقات للهواتف بدلاً من الجدول
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {orders.map((order) => (
          <Card key={order._id} sx={{ p: 1.5 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="subtitle2" fontWeight="bold">
                #{order._id?.slice(-6)}
              </Typography>
              <Chip
                label={statusLabels[order.status] || order.status}
                size="small"
                color={statusColors[order.status] || 'default'}
              />
            </Box>
            <Typography variant="body2" color="textSecondary">
              {order.user?.name || order.userId || 'غير معروف'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {order.store?.name || order.storeId || 'غير معروف'}
            </Typography>
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
              <Typography variant="body2" fontWeight="bold">
                {formatCurrency(order.totalPrice)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatDate(order.createdAt, 'HH:mm')}
              </Typography>
              <IconButton
                size="small"
                onClick={() => navigate(`/orders/${order._id}`)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>
    );
  }
  
  // عرض جدول للشاشات الكبيرة
  return (
    <TableContainer sx={{ overflowX: 'auto' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>رقم الطلب</TableCell>
            <TableCell>العميل</TableCell>
            <TableCell>المتجر</TableCell>
            <TableCell>المبلغ</TableCell>
            <TableCell>الحالة</TableCell>
            <TableCell>التاريخ</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id} hover>
              <TableCell>#{order._id?.slice(-6)}</TableCell>
              <TableCell>{order.user?.name || order.userId || 'غير معروف'}</TableCell>
              <TableCell>{order.store?.name || order.storeId || 'غير معروف'}</TableCell>
              <TableCell>{formatCurrency(order.totalPrice)}</TableCell>
              <TableCell>
                <Chip
                  label={statusLabels[order.status] || order.status}
                  size="small"
                  color={statusColors[order.status] || 'default'}
                />
              </TableCell>
              <TableCell>{formatDate(order.createdAt, 'HH:mm')}</TableCell>
              <TableCell>
                <Tooltip title="عرض التفاصيل">
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/orders/${order._id}`)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}