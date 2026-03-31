import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { driversService } from '../../../api';

export default function DriverLocation({ driverId }) {
  const [location, setLocation] = useState(null);
  
  const { data, isLoading, error, refetch } = useQuery(
    ['driver-location', driverId],
    () => driversService.getDriverLocation(driverId),
    {
      refetchInterval: 5000, // تحديث كل 5 ثواني
      onSuccess: (data) => setLocation(data.data),
    }
  );
  
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Alert severity="error">
        لا يمكن تحميل موقع المندوب: {error.message}
      </Alert>
    );
  }
  
  if (!location) {
    return (
      <Alert severity="info">
        الموقع غير متاح حالياً. قد يكون المندوب غير متصل.
      </Alert>
    );
  }
  
  return (
    <Box>
      <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          آخر تحديث: {new Date(location.updatedAt).toLocaleString('ar-SA')}
        </Typography>
        <Typography variant="body1">
          <strong>خط العرض:</strong> {location.location?.latitude}
        </Typography>
        <Typography variant="body1">
          <strong>خط الطول:</strong> {location.location?.longitude}
        </Typography>
        {location.address && (
          <Typography variant="body1">
            <strong>العنوان:</strong> {location.address}
          </Typography>
        )}
        {location.speed && (
          <Typography variant="body1">
            <strong>السرعة:</strong> {location.speed} كم/س
          </Typography>
        )}
      </Paper>
      
      {/* خريطة بسيطة - يمكن استبدالها بخدمة خرائط حقيقية */}
      <Box
        sx={{
          width: '100%',
          height: 400,
          bgcolor: '#e0e0e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="body2" color="textSecondary">
          عرض الخريطة
        </Typography>
        <Typography variant="caption" color="textSecondary">
          الإحداثيات: {location.location?.latitude}, {location.location?.longitude}
        </Typography>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
          (يمكن دمج Google Maps أو Mapbox هنا)
        </Typography>
      </Box>
    </Box>
  );
}