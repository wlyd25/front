import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  MenuItem,
  Button,
  Box,
  Grid,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usersService } from '../../../api';

const validationSchema = Yup.object({
  name: Yup.string().required('الاسم مطلوب').min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: Yup.string().required('رقم الهاتف مطلوب').matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{4,6}$/, 'رقم هاتف غير صحيح'),
  email: Yup.string().email('بريد إلكتروني غير صحيح'),
  password: Yup.string().when('isEdit', {
    is: false,
    then: (schema) => schema.required('كلمة المرور مطلوبة').min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
    otherwise: (schema) => schema.notRequired(),
  }),
  role: Yup.string().required('الدور مطلوب'),
  isActive: Yup.boolean(),
  isVerified: Yup.boolean(),
});

export default function UserForm({ user, onSuccess, onCancel }) {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isEdit = !!user;

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
      password: '',
      role: user?.role || 'client',
      isActive: user?.isActive !== undefined ? user.isActive : true,
      isVerified: user?.isVerified !== undefined ? user.isVerified : false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      
      try {
        if (isEdit) {
          const { password, ...updateData } = values;
          await usersService.updateUser(user._id, updateData);
        } else {
          await usersService.createUser(values);
        }
        onSuccess();
      } catch (err) {
        setError(err.response?.data?.message || 'حدث خطأ أثناء حفظ المستخدم');
      } finally {
        setLoading(false);
      }
    },
  });

  const roles = [
    { value: 'admin', label: 'مشرف' },
    { value: 'vendor', label: 'تاجر' },
    { value: 'driver', label: 'مندوب' },
    { value: 'client', label: 'عميل' },
  ];

  return (
    <form onSubmit={formik.handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="name"
            label="الاسم"
            value={formik.values.name}
            onChange={formik.handleChange}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="phone"
            label="رقم الهاتف"
            value={formik.values.phone}
            onChange={formik.handleChange}
            error={formik.touched.phone && Boolean(formik.errors.phone)}
            helperText={formik.touched.phone && formik.errors.phone}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            name="email"
            label="البريد الإلكتروني"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            name="role"
            label="الدور"
            value={formik.values.role}
            onChange={formik.handleChange}
            error={formik.touched.role && Boolean(formik.errors.role)}
            helperText={formik.touched.role && formik.errors.role}
            disabled={loading}
          >
            <MenuItem value="">اختر دور</MenuItem>
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        {!isEdit && (
          <Grid item xs={12}>
            <TextField
              fullWidth
              name="password"
              label="كلمة المرور"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              disabled={loading}
            />
          </Grid>
        )}
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="isActive"
                checked={formik.values.isActive}
                onChange={formik.handleChange}
                disabled={loading}
              />
            }
            label="حساب نشط"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                name="isVerified"
                checked={formik.values.isVerified}
                onChange={formik.handleChange}
                disabled={loading}
              />
            }
            label="حساب موثق"
          />
        </Grid>
      </Grid>
      
      <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          إلغاء
        </Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : isEdit ? 'تحديث' : 'إضافة'}
        </Button>
      </Box>
    </form>
  );
}