import { Grid, Card, CardContent, Typography, Divider } from '@mui/material';

export default function NotificationsStats({ stats = {} }) {
  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="primary">{stats.total || 0}</Typography><Typography variant="body2">إجمالي الإشعارات</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="success.main">{stats.sent || 0}</Typography><Typography variant="body2">تم الإرسال</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="warning.main">{stats.pending || 0}</Typography><Typography variant="body2">قيد الانتظار</Typography></CardContent></Card></Grid>
        <Grid item xs={12} sm={6} md={3}><Card><CardContent><Typography variant="h4" color="error.main">{stats.failed || 0}</Typography><Typography variant="body2">فشل الإرسال</Typography></CardContent></Card></Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography variant="subtitle2" gutterBottom>حسب النوع</Typography>
      {stats.byType?.map((item) => (<Box key={item.type} display="flex" justifyContent="space-between" mb={1}><Typography variant="body2">{item.type}</Typography><Typography variant="body2" fontWeight="bold">{item.count}</Typography></Box>))}
    </Box>
  );
}