import { Box, Grid, Typography, Paper, Avatar, Chip, Rating } from '@mui/material';
import { formatDate } from '../../../utils/formatters';

export default function StoreDetails({ store }) {
  // التحقق من وجود البيانات
  if (!store) return null;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} textAlign="center">
            <Avatar 
              src={store.logo} 
              sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
            >
              {store.name?.charAt(0)}
            </Avatar>
            <Typography variant="h6">{store.name}</Typography>
            <Box display="flex" justifyContent="center" mt={1}>
              <Rating value={store.averageRating || 0} readOnly precision={0.5} />
              <Typography variant="caption" sx={{ ml: 1 }}>
                ({store.ratingsCount || 0})
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" gutterBottom>
              <strong>الوصف:</strong> {store.description || '-'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>التصنيف:</strong> {store.category || '-'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>رقم الهاتف:</strong> {store.phone || '-'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>البريد الإلكتروني:</strong> {store.email || '-'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>العنوان:</strong> {store.address?.city || '-'}, {store.address?.country || '-'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>عدد المنتجات:</strong> {store.stats?.productsCount || store.productsCount || 0}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>تاريخ التسجيل:</strong> {formatDate(store.createdAt)}
            </Typography>
            <Box display="flex" gap={1} mt={2}>
              <Chip 
                label={store.isVerified ? 'موثق' : 'غير موثق'} 
                color={store.isVerified ? 'primary' : 'default'} 
                size="small"
              />
              <Chip 
                label={store.isOpen ? 'مفتوح' : 'مغلق'} 
                color={store.isOpen ? 'success' : 'error'} 
                size="small"
              />
              {store.deliveryInfo?.hasDelivery && (
                <Chip 
                  label={`توصيل: ${store.deliveryInfo.deliveryFee} ₪`} 
                  color="info" 
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
}