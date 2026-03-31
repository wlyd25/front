import { useState } from 'react';
import { TextField, Button, Box, Grid, MenuItem, FormControlLabel, Switch, Alert, CircularProgress } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { notificationsService } from '../../../api';

const validationSchema = Yup.object({
  title: Yup.string().required('العنوان مطلوب').max(100),
  message: Yup.string().required('نص الإشعار مطلوب').max(500),
  type: Yup.string().required('النوع مطلوب'),
  priority: Yup.string(),
});

export default function SendNotification({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: { title: '', message: '', type: 'system', priority: 'normal' },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      setError('');
      try {
        await notificationsService.sendNotification(values);
        onSuccess();
        formik.resetForm();
      } catch (err) {
        setError(err.response?.data?.message || 'فشل إرسال الإشعار');
      } finally {
        setLoading(false);
      }
    },
  });

  const notificationTypes = [{ value: 'order', label: 'طلب' }, { value: 'promotion', label: 'عرض ترويجي' }, { value: 'system', label: 'نظام' }, { value: 'chat', label: 'دردشة' }];
  const priorities = [{ value: 'low', label: 'منخفضة' }, { value: 'normal', label: 'عادية' }, { value: 'high', label: 'عالية' }];

  return (
    <form onSubmit={formik.handleSubmit}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Grid container spacing={2}>
        <Grid item xs={12}><TextField fullWidth name="title" label="عنوان الإشعار" value={formik.values.title} onChange={formik.handleChange} error={formik.touched.title && Boolean(formik.errors.title)} disabled={loading} /></Grid>
        <Grid item xs={12}><TextField fullWidth name="message" label="نص الإشعار" multiline rows={4} value={formik.values.message} onChange={formik.handleChange} error={formik.touched.message && Boolean(formik.errors.message)} disabled={loading} /></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth select name="type" label="النوع" value={formik.values.type} onChange={formik.handleChange}>{notificationTypes.map(t => (<MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>))}</TextField></Grid>
        <Grid item xs={12} sm={6}><TextField fullWidth select name="priority" label="الأولوية" value={formik.values.priority} onChange={formik.handleChange}>{priorities.map(p => (<MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>))}</TextField></Grid>
      </Grid>
      <Box display="flex" justifyContent="flex-end" sx={{ mt: 3 }}><Button type="submit" variant="contained" disabled={loading}>{loading ? <CircularProgress size={24} /> : 'إرسال الإشعار'}</Button></Box>
    </form>
  );
}