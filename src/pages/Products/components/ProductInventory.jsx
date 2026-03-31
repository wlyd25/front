import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import {
  TextField,
  Button,
  Box,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  Paper,
} from '@mui/material';
import { productsService } from '../../../api';

export default function ProductInventory({ product, onSuccess }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    quantity: product?.inventory?.quantity || 0,
    operation: 'set',
    unit: product?.inventory?.unit || 'piece',
    lowStockThreshold: product?.inventory?.lowStockThreshold || 5,
  });
  
  const updateInventoryMutation = useMutation(
    () => productsService.updateInventory(product.id, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        onSuccess();
      },
      onError: (err) => {
        setError(err.response?.data?.message || 'فشل تحديث المخزون');
      },
    }
  );
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    updateInventoryMutation.mutate();
    setLoading(false);
  };
  
  const operations = [
    { value: 'set', label: 'تعيين' },
    { value: 'add', label: 'إضافة' },
    { value: 'subtract', label: 'خصم' },
  ];
  
  const units = [
    { value: 'piece', label: 'قطعة' },
    { value: 'kg', label: 'كيلوغرام' },
    { value: 'g', label: 'غرام' },
    { value: 'liter', label: 'لتر' },
    { value: 'ml', label: 'ملليلتر' },
    { value: 'box', label: 'صندوق' },
  ];
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="textSecondary">
          المخزون الحالي
        </Typography>
        <Typography variant="h5">
          {product?.inventory?.quantity || 0} {product?.inventory?.unit || 'قطعة'}
        </Typography>
        {product?.inventory?.quantity <= product?.inventory?.lowStockThreshold && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            المخزون منخفض! الحد الأدنى: {product?.inventory?.lowStockThreshold || 5}
          </Alert>
        )}
      </Paper>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="العملية"
            value={formData.operation}
            onChange={(e) => setFormData({ ...formData, operation: e.target.value })}
            disabled={loading}
          >
            {operations.map((op) => (
              <MenuItem key={op.value} value={op.value}>
                {op.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="الكمية"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
            disabled={loading}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="الوحدة"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            disabled={loading}
          >
            {units.map((unit) => (
              <MenuItem key={unit.value} value={unit.value}>
                {unit.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            type="number"
            label="حد التنبيه للمخزون المنخفض"
            value={formData.lowStockThreshold}
            onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
            disabled={loading}
          />
        </Grid>
      </Grid>
      
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'تحديث المخزون'}
        </Button>
      </Box>
    </form>
  );
}