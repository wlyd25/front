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

export default function RecentOrders({ orders = [] }) {
  const navigate = useNavigate();
  
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
          {orders.map((order) => (
            <TableRow key={order.id} hover>
              <TableCell>#{order.id.slice(-6)}</TableCell>
              <TableCell>{order.user?.name || order.userId}</TableCell>
              <TableCell>{order.store?.name || order.storeId}</TableCell>
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
                    onClick={() => navigate(`/orders/${order.id}`)}
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