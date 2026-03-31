import { Grid, Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

export default function OrderStats({ stats = {} }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4">{stats.totalOrders?.toLocaleString() || 0}</Typography><Typography variant="body2">إجمالي الطلبات</Typography></CardContent></Card></Grid>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="success.main">{stats.completedOrders?.toLocaleString() || 0}</Typography><Typography variant="body2">طلبات مكتملة</Typography></CardContent></Card></Grid>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="error.main">{stats.cancelledOrders?.toLocaleString() || 0}</Typography><Typography variant="body2">طلبات ملغية</Typography></CardContent></Card></Grid>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4">{formatCurrency(stats.totalRevenue || 0)}</Typography><Typography variant="body2">إجمالي الإيرادات</Typography></CardContent></Card></Grid>
    </Grid>
  );
}