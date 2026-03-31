import {
  Box,
  Grid,
  Typography,
  Paper,
  Chip,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const steps = ['قيد الانتظار', 'تم القبول', 'جاهز', 'تم الاستلام', 'تم التوصيل'];

export default function OrderDetails({ order }) {
  const currentStep = (() => {
    const statuses = ['pending', 'accepted', 'ready', 'picked', 'delivered'];
    const index = statuses.indexOf(order.status);
    return index >= 0 ? index : 0;
  })();
  
  return (
    <Box>
      {/* حالة الطلب */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          حالة الطلب
        </Typography>
        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      <Grid container spacing={2}>
        {/* معلومات العميل */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              معلومات العميل
            </Typography>
            <Typography variant="body2">
              <strong>الاسم:</strong> {order.user?.name || order.userId}
            </Typography>
            <Typography variant="body2">
              <strong>رقم الهاتف:</strong> {order.user?.phone || '-'}
            </Typography>
            {order.user?.email && (
              <Typography variant="body2">
                <strong>البريد الإلكتروني:</strong> {order.user.email}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* معلومات المتجر */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              معلومات المتجر
            </Typography>
            <Typography variant="body2">
              <strong>اسم المتجر:</strong> {order.store?.name || order.storeId}
            </Typography>
            <Typography variant="body2">
              <strong>رقم الهاتف:</strong> {order.store?.phone || '-'}
            </Typography>
            {order.store?.address && (
              <Typography variant="body2">
                <strong>العنوان:</strong> {order.store.address}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* معلومات المندوب */}
        {order.driver && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                معلومات المندوب
              </Typography>
              <Typography variant="body2">
                <strong>الاسم:</strong> {order.driver?.name || order.driver}
              </Typography>
              <Typography variant="body2">
                <strong>رقم الهاتف:</strong> {order.driver?.phone || '-'}
              </Typography>
            </Paper>
          </Grid>
        )}
        
        {/* عنوان التوصيل */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              عنوان التوصيل
            </Typography>
            <Typography variant="body2">
              {order.deliveryAddress?.addressLine || order.deliveryAddress}
            </Typography>
            {order.deliveryAddress?.city && (
              <Typography variant="body2">
                المدينة: {order.deliveryAddress.city}
              </Typography>
            )}
            {order.deliveryAddress?.area && (
              <Typography variant="body2">
                المنطقة: {order.deliveryAddress.area}
              </Typography>
            )}
            {order.deliveryInstructions && (
              <Typography variant="body2">
                <strong>تعليمات التوصيل:</strong> {order.deliveryInstructions}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* تفاصيل الطلب */}
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          تفاصيل الطلب
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>المنتج</TableCell>
                <TableCell align="center">الكمية</TableCell>
                <TableCell align="center">السعر</TableCell>
                <TableCell align="center">الإجمالي</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items?.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell align="center">{item.quantity || item.qty}</TableCell>
                  <TableCell align="center">{formatCurrency(item.price)}</TableCell>
                  <TableCell align="center">
                    {formatCurrency((item.price) * (item.quantity || item.qty))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <Typography variant="body2">
            <strong>المجموع الفرعي:</strong> {formatCurrency(order.subtotal || order.totalPrice)}
          </Typography>
          {order.deliveryFee > 0 && (
            <Typography variant="body2">
              <strong>رسوم التوصيل:</strong> {formatCurrency(order.deliveryFee)}
              </Typography>
          )}
          {order.discount > 0 && (
            <Typography variant="body2" color="success.main">
              <strong>الخصم:</strong> -{formatCurrency(order.discount)}
            </Typography>
          )}
          <Typography variant="h6">
            <strong>الإجمالي:</strong> {formatCurrency(order.totalPrice)}
          </Typography>
        </Box>
        
        <Box mt={2} display="flex" gap={1}>
          <Chip
            label={`طريقة الدفع: ${order.paymentMethod === 'cash' ? 'كاش' : order.paymentMethod === 'card' ? 'بطاقة' : 'محفظة'}`}
            size="small"
          />
          <Chip
            label={`حالة الدفع: ${order.paymentStatus === 'paid' ? 'مدفوع' : order.paymentStatus === 'pending' ? 'قيد الانتظار' : 'فشل'}`}
            size="small"
            color={order.paymentStatus === 'paid' ? 'success' : 'warning'}
          />
          <Chip
            label={`تاريخ الطلب: ${formatDate(order.createdAt)}`}
            size="small"
          />
        </Box>
      </Paper>
    </Box>
  );
}