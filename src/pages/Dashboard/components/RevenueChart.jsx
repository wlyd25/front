import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

export default function RevenueChart({ data = [] }) {
  if (data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height={300}>
        <Typography color="textSecondary">لا توجد بيانات</Typography>
      </Box>
    );
  }
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis tickFormatter={(value) => formatCurrency(value, '')} />
        <Tooltip formatter={(value) => formatCurrency(value)} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.3}
          name="الإيرادات"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}