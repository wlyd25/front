import { Chip } from '@mui/material';
import { ORDER_STATUS, STATUS_COLORS } from '../../utils/constants';

const statusLabels = {
  [ORDER_STATUS.PENDING]: 'قيد الانتظار',
  [ORDER_STATUS.ACCEPTED]: 'مقبول',
  [ORDER_STATUS.READY]: 'جاهز',
  [ORDER_STATUS.PICKED]: 'تم الاستلام',
  [ORDER_STATUS.DELIVERED]: 'تم التوصيل',
  [ORDER_STATUS.CANCELLED]: 'ملغي',
  active: 'نشط',
  inactive: 'غير نشط',
  verified: 'موثق',
  unverified: 'غير موثق',
};

export default function StatusBadge({ status, size = 'small' }) {
  const label = statusLabels[status] || status;
  const color = STATUS_COLORS[status] || '#999';
  
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 500,
      }}
    />
  );
}