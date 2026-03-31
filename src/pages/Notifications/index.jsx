import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControlLabel,
  Switch,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Divider,
} from '@mui/material';
import { Send, Refresh, BarChart } from '@mui/icons-material';
import { notificationsService, usersService } from '../../api';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  title: Yup.string().required('العنوان مطلوب').max(100, 'العنوان طويل جداً'),
  message: Yup.string().required('نص الإشعار مطلوب').max(500, 'النص طويل جداً'),
  type: Yup.string().required('النوع مطلوب'),
  priority: Yup.string(),
  userIds: Yup.array().min(1, 'يجب اختيار مستخدم واحد على الأقل'),
});

export default function Notifications() {
  const queryClient = useQueryClient();
  const [sendToAll, setSendToAll] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // جلب المستخدمين
  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['users-for-notifications', searchUser],
    () => usersService.getUsers({ search: searchUser || undefined, limit: 20 }),
    { enabled: !sendToAll }
  );
  
  // إحصائيات الإشعارات
  const { data: statsData } = useQuery(
    'notifications-stats',
    () => notificationsService.getAllNotificationsStats()
  );
  
  // إرسال إشعار
  const sendMutation = useMutation(
    (data) => notificationsService.sendNotification(data),
    {
      onSuccess: () => {
        setSnackbar({ open: true, message: 'تم إرسال الإشعارات بنجاح', severity: 'success' });
        formik.resetForm();
        setSelectedUserIds([]);
        queryClient.invalidateQueries('notifications-stats');
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || 'فشل إرسال الإشعارات',
          severity: 'error',
        });
      },
    }
  );
  
  const formik = useFormik({
    initialValues: {
      title: '',
      message: '',
      type: 'system',
      priority: 'normal',
      link: '',
      icon: '',
    },
    validationSchema,
    onSubmit: (values) => {
      const payload = {
        ...values,
        userIds: sendToAll ? [] : selectedUserIds,
        sendToAll: sendToAll,
      };
      sendMutation.mutate(payload);
    },
  });
  
  const notificationTypes = [
    { value: 'order', label: 'طلب' },
    { value: 'promotion', label: 'عرض ترويجي' },
    { value: 'system', label: 'نظام' },
    { value: 'chat', label: 'دردشة' },
    { value: 'loyalty', label: 'ولاء' },
  ];
  
  const priorities = [
    { value: 'low', label: 'منخفضة' },
    { value: 'normal', label: 'عادية' },
    { value: 'high', label: 'عالية' },
    { value: 'urgent', label: 'طارئة' },
  ];
  
  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* نموذج إرسال إشعار */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
              إرسال إشعار جديد
            </Typography>
            
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="title"
                    label="عنوان الإشعار"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="message"
                    label="نص الإشعار"
                    multiline
                    rows={4}
                    value={formik.values.message}
                    onChange={formik.handleChange}
                    error={formik.touched.message && Boolean(formik.errors.message)}
                    helperText={formik.touched.message && formik.errors.message}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="type"
                    label="نوع الإشعار"
                    value={formik.values.type}
                    onChange={formik.handleChange}
                  >
                    {notificationTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    select
                    name="priority"
                    label="الأولوية"
                    value={formik.values.priority}
                    onChange={formik.handleChange}
                  >
                    {priorities.map((priority) => (
                      <MenuItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    name="link"
                    label="رابط (اختياري)"
                    value={formik.values.link}
                    onChange={formik.handleChange}
                    placeholder="https://..."
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sendToAll}
                        onChange={(e) => setSendToAll(e.target.checked)}
                      />
                    }
                    label="إرسال لجميع المستخدمين"
                  />
                </Grid>
                
                {!sendToAll && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="البحث عن مستخدمين"
                      value={searchUser}
                      onChange={(e) => setSearchUser(e.target.value)}
                      placeholder="الاسم أو رقم الهاتف..."
                      InputProps={{
                        endAdornment: usersLoading && <CircularProgress size={20} />,
                      }}
                    />
                    <Box sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                      {usersData?.data?.users?.map((user) => (
                        <Card
                          key={user.id}
                          sx={{
                            mb: 1,
                            cursor: 'pointer',
                            bgcolor: selectedUserIds.includes(user.id) ? 'action.selected' : 'background.paper',
                          }}
                          onClick={() => {
                            if (selectedUserIds.includes(user.id)) {
                              setSelectedUserIds(selectedUserIds.filter(id => id !== user.id));
                            } else {
                              setSelectedUserIds([...selectedUserIds, user.id]);
                            }
                          }}
                        >
                          <CardContent>
                            <Typography variant="body1">{user.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {user.phone} - {user.email}
                            </Typography>
                            <Chip
                              label={user.role}
                              size="small"
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                    {selectedUserIds.length > 0 && (
                      <Alert severity="info" sx={{ mt: 2 }}>
                        تم اختيار {selectedUserIds.length} مستخدم
                      </Alert>
                    )}
                  </Grid>
                )}
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    disabled={sendMutation.isLoading}
                    fullWidth
                    size="large"
                  >
                    {sendMutation.isLoading ? <CircularProgress size={24} /> : 'إرسال الإشعار'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        
        {/* إحصائيات الإشعارات */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                إحصائيات الإشعارات
              </Typography>
              <BarChart color="action" />
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {statsData?.data?.total || 0}
                    </Typography>
                    <Typography variant="body2">إجمالي الإشعارات</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {statsData?.data?.sent || 0}
                    </Typography>
                    <Typography variant="body2">تم الإرسال</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {statsData?.data?.pending || 0}
                    </Typography>
                    <Typography variant="body2">قيد الانتظار</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="error.main">
                      {statsData?.data?.failed || 0}
                    </Typography>
                    <Typography variant="body2">فشل الإرسال</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              حسب النوع
            </Typography>
            {statsData?.data?.byType?.map((item) => (
              <Box key={item.type} display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">
                  {notificationTypes.find(t => t.value === item.type)?.label || item.type}
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {item.count}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}