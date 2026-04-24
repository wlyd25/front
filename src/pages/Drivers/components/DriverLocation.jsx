// src/pages/Drivers/components/DriverLocation.jsx

import { Box, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { driversService } from '../../../api';
import { getDriverCoordinates, isValidCoordinate } from '../../../utils/mapHelpers';
import { useQuery } from 'react-query';

export default function DriverLocation({ driverId }) {
    const { data, isLoading, error } = useQuery(
        ['driver-location', driverId],
        () => driversService.getDriverLocation(driverId),
        {
            refetchInterval: 10000, // تحديث كل 10 ثواني
            onSuccess: (data) => {
                console.log('📍 Driver location updated:', data?.data);
            }
        }
    );
    
    const driver = data?.data || {};
    const coords = getDriverCoordinates(driver);
    
    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }
    
    if (error) {
        return (
            <Alert severity="error" sx={{ m: 2 }}>
                لا يمكن تحميل موقع المندوب: {error.message}
            </Alert>
        );
    }
    
    if (!coords) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                الموقع غير متاح حالياً. قد يكون المندوب غير متصل.
            </Alert>
        );
    }
    
    return (
        <Box>
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.default' }}>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                    آخر تحديث: {new Date(driver.updatedAt || Date.now()).toLocaleString('ar-SA')}
                </Typography>
                <Typography variant="body1">
                    <strong>خط العرض:</strong> {coords.lat.toFixed(6)}
                </Typography>
                <Typography variant="body1">
                    <strong>خط الطول:</strong> {coords.lng.toFixed(6)}
                </Typography>
                {driver.speed && (
                    <Typography variant="body1">
                        <strong>السرعة:</strong> {driver.speed} كم/س
                    </Typography>
                )}
                {driver.heading && (
                    <Typography variant="body1">
                        <strong>الاتجاه:</strong> {driver.heading}°
                    </Typography>
                )}
            </Paper>
            
            {/* خريطة مبسطة */}
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
                    position: 'relative',
                }}
            >
                <Typography variant="body2" color="textSecondary">
                    🗺️ عرض الخريطة
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                    الإحداثيات: {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°
                </Typography>
                <Typography variant="caption" color="textSecondary">
                    (يمكن دمج Mapbox أو Google Maps هنا)
                </Typography>
            </Box>
        </Box>
    );
}