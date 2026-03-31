import { Box, Grid, Typography, Paper, Avatar, Chip, Divider } from '@mui/material';
import { formatDate } from '../../../utils/formatters';

export default function UserDetails({ user }) {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
        <Avatar src={user.image} sx={{ width: 100, height: 100, mx: 'auto', mb: 2 }}>{user.name?.charAt(0)}</Avatar>
        <Typography variant="h5">{user.name}</Typography>
        <Box display="flex" justifyContent="center" gap={1} mt={2}>
          {user.isVerified && <Chip label="موثق" color="primary" size="small" />}
          <Chip label={user.isActive ? 'نشط' : 'غير نشط'} color={user.isActive ? 'success' : 'error'} size="small" />
          <Chip label={user.role === 'admin' ? 'مشرف' : user.role === 'vendor' ? 'تاجر' : user.role === 'driver' ? 'مندوب' : 'عميل'} size="small" />
        </Box>
      </Paper>
      <Typography variant="h6" gutterBottom>معلومات الاتصال</Typography>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}><Typography variant="body2" color="textSecondary">رقم الهاتف</Typography><Typography variant="body1">{user.phone}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="body2" color="textSecondary">البريد الإلكتروني</Typography><Typography variant="body1">{user.email || '-'}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="body2" color="textSecondary">تاريخ التسجيل</Typography><Typography variant="body1">{formatDate(user.createdAt)}</Typography></Grid>
          <Grid item xs={12} sm={6}><Typography variant="body2" color="textSecondary">آخر تحديث</Typography><Typography variant="body1">{formatDate(user.updatedAt)}</Typography></Grid>
        </Grid>
      </Paper>
    </Box>
  );
}