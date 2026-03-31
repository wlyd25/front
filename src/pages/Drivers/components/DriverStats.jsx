import { Grid, Card, CardContent, Typography } from '@mui/material';
import { formatCurrency } from '../../../utils/formatters';

export default function DriverStats({ stats = {} }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4">{stats.totalDeliveries?.toLocaleString() || 0}</Typography><Typography variant="body2">إجمالي التوصيلات</Typography></CardContent></Card></Grid>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="success.main">{stats.todayDeliveries || 0}</Typography><Typography variant="body2">توصيلات اليوم</Typography></CardContent></Card></Grid>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="warning.main">{stats.weeklyDeliveries || 0}</Typography><Typography variant="body2">توصيلات الأسبوع</Typography></CardContent></Card></Grid>
      <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4">{formatCurrency(stats.totalEarnings || 0)}</Typography><Typography variant="body2">إجمالي الأرباح</Typography></CardContent></Card></Grid>
    </Grid>
  );
}