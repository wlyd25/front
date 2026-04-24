// src/pages/Map/index.jsx - النسخة المعدلة بالكامل

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { useResponsive } from '../../hooks/useResponsive';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Rating,
    Snackbar,
    Fab,
    Badge,
    Zoom,
    FormControlLabel,
    Switch,
    Tabs,
    Tab,
    Collapse,
    Divider,
    MenuItem,
    Grid,
} from '@mui/material';
import {
    Refresh,
    MyLocation,
    Search,
    LocalShipping,
    Storefront,
    LocationOn,
    Directions,
    Update,
    ZoomIn,
    ZoomOut,
    FilterList,
    ClearAll,
} from '@mui/icons-material';
import { mapService, ordersService, storesService, driversService } from '../../api';
import DriverLocationMap from '../../components/Map/DriverLocationMap';
import OrderTrackingMap from '../../components/Map/OrderTrackingMap';
import StoreMap from '../../components/Map/StoreMap';

const TABS = {
    DRIVERS: 'drivers',
    ORDERS: 'orders',
    STORES: 'stores',
    SEARCH: 'search',
};

const SafeTooltip = ({ title, children, disabled, ...props }) => {
    if (disabled) {
        return (
            <Tooltip title={title} {...props}>
                <span style={{ display: 'inline-flex' }}>{children}</span>
            </Tooltip>
        );
    }
    return <Tooltip title={title} {...props}>{children}</Tooltip>;
};

// ✅ دالة الحصول على حالة المندوب (محسنة)
const getDriverStatus = (driver) => {



    console.log('🔍 Driver data:', {
        name: driver.name,
        isActive: driver.isActive,
        isOnline: driver.isOnline,
        isAvailable: driver.driverInfo?.isAvailable,
        hasActiveOrder: driver.currentOrder !== null,
        driverInfo: driver.driverInfo
    });


    const isActive = driver.isActive === true;
    const isOnline = driver.isOnline === true;
    const isAvailable = driver.driverInfo?.isAvailable === true;
    const hasActiveOrder = driver.currentOrder !== null && driver.currentOrder !== undefined;

    if (!isActive) return { color: '#F44336', label: 'حساب معطل', icon: '🔴' };
    if (!isOnline) return { color: '#FF9800', label: 'غير متصل', icon: '🟠' };
    if (hasActiveOrder) return { color: '#FF9800', label: 'مشغول بتوصيلة', icon: '🚚' };
    if (isOnline && !isAvailable) return { color: '#FFC107', label: 'متصل - غير متاح', icon: '🟡' };
    if (isOnline && isAvailable) return { color: '#4CAF50', label: 'متصل ومتاح', icon: '🟢' };
    return { color: '#9E9E9E', label: 'غير معروف', icon: '⚫' };
};

export default function MapPage() {
    const { isMobile, isTablet, fontSize, spacing } = useResponsive();
    const queryClient = useQueryClient();
    const mapRef = useRef(null);
    const [activeTab, setActiveTab] = useState(TABS.DRIVERS);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [nearbyStores, setNearbyStores] = useState([]);
    const [loadingLocation, setLoadingLocation] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [updatingStores, setUpdatingStores] = useState(false);
    const [autoRefreshInterval] = useState(30000);
    const [showDriverFilters, setShowDriverFilters] = useState(false);

    const [driverFilters, setDriverFilters] = useState({
        showOnlineOnly: false,
        showAvailableOnly: false,
        minRating: 0,
    });

    const [mapZoom, setMapZoom] = useState(12);
    const [mapCenter, setMapCenter] = useState(null);

    const mapHeight = isMobile ? 400 : isTablet ? 500 : 560;
    const sidePanelHeight = isMobile ? 400 : 650;

    // ✅ جلب المندوبين



    const {
        data: driversRawData,
        isLoading: driversLoading,
        refetch: refetchDrivers,
        isFetching: isDriversFetching
    } = useQuery(
        'drivers-locations',
        () => {
            console.log('🔄 Fetching drivers data from API...');
            return driversService.getDrivers({ limit: 100 });
        },
        {
            enabled: activeTab === TABS.DRIVERS,
            refetchInterval: autoRefreshInterval,
            onSuccess: (data) => {
                console.log('✅ Drivers API Response:', data);
                console.log('📊 Response structure:', Object.keys(data));
                console.log('📊 Data.data:', data?.data);
                console.log('📊 Data.data[0]:', data?.data?.[0]);
            },
            onError: (error) => {
                console.error('❌ Drivers API Error:', error);
            }
        }
    );




    const driversList = useMemo(() => {
        if (!driversRawData) return [];
        const data = driversRawData?.data || driversRawData;
        const list = Array.isArray(data) ? data : [];

        // ✅ طباعة تفصيلية للبيانات
        console.log('🚚 Drivers List Raw:', list);
        console.log('📊 Total drivers count:', list.length);

        list.forEach((driver, idx) => {
            console.log(`Driver ${idx + 1}:`, {
                id: driver._id,
                name: driver.name,
                isActive: driver.isActive,
                isOnline: driver.isOnline,
                isAvailable: driver.driverInfo?.isAvailable,
                rating: driver.rating,
                location: driver.driverInfo?.currentLocation?.coordinates
            });
        });

        return list;
    }, [driversRawData]);




    // ✅ تطبيق الفلاتر
    const filteredDriversList = useMemo(() => {
        let drivers = [...driversList];
        if (driverFilters.showOnlineOnly) {
            drivers = drivers.filter(d => d.isOnline === true);
        }
        if (driverFilters.showAvailableOnly) {
            drivers = drivers.filter(d => d.driverInfo?.isAvailable === true);
        }
        if (driverFilters.minRating > 0) {
            drivers = drivers.filter(d => (d.rating || d.driverInfo?.rating || 0) >= driverFilters.minRating);
        }
        return drivers;
    }, [driversList, driverFilters]);

    // ✅ إحصائيات سريعة
    const driversStats = useMemo(() => {
        const total = driversList.length;
        const online = driversList.filter(d => d.isOnline === true).length;
        const available = driversList.filter(d => d.driverInfo?.isAvailable === true && d.isOnline === true).length;
        return { total, online, available };
    }, [driversList]);

    // جلب الطلبات النشطة
    const { data: activeOrders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery(
        'active-orders',
        () => ordersService.getOrders({ page: 1, limit: 50, status: 'accepted,ready,picked' }),
        {
            enabled: activeTab === TABS.ORDERS,
            refetchInterval: autoRefreshInterval,
        }
    );

    // جلب المتاجر
    const { data: allStores, refetch: refetchStores, isLoading: storesLoading } = useQuery(
        'all-stores',
        () => storesService.getStores({ limit: 100 }),
        { enabled: activeTab === TABS.STORES }
    );

    // استخراج إحداثيات المندوب
    const getDriverCoords = useCallback((driver) => {
        const coords = driver?.driverInfo?.currentLocation?.coordinates;
        if (coords && Array.isArray(coords) && coords.length >= 2) {
            return { lat: parseFloat(coords[1]), lng: parseFloat(coords[0]) };
        }
        return null;
    }, []);

    // تحديث المتاجر
    const handleUpdateStoresCoordinates = async () => {
        try {
            setUpdatingStores(true);
            await storesService.updateStoreCoordinates();
            await refetchStores();
            if (userLocation) {
                const response = await mapService.getStoresMap({ lat: userLocation.lat, lng: userLocation.lng, radius: 5000 });
                setNearbyStores(response.data?.stores || []);
            }
            setSnackbar({ open: true, message: 'تم تحديث مواقع المتاجر', severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: 'فشل تحديث مواقع المتاجر', severity: 'error' });
        } finally {
            setUpdatingStores(false);
        }
    };

    // تحديث جميع البيانات
    const refreshAllData = async () => {
        if (activeTab === TABS.DRIVERS) await refetchDrivers();
        if (activeTab === TABS.ORDERS) await refetchOrders();
        if (activeTab === TABS.STORES) await refetchStores();
        setSnackbar({ open: true, message: 'تم تحديث البيانات', severity: 'success' });
    };

    // الحصول على موقع المستخدم
    const getUserLocation = useCallback(() => {
        setLoadingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = { lat: position.coords.latitude, lng: position.coords.longitude };
                setUserLocation(location);
                setMapCenter(location);
                setLoadingLocation(false);
                if (activeTab === TABS.STORES) {
                    mapService.getStoresMap({ lat: location.lat, lng: location.lng, radius: 5000 })
                        .then(res => setNearbyStores(res.data?.stores || []));
                }
            },
            () => { setError('فشل الحصول على الموقع'); setLoadingLocation(false); },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [activeTab]);

    // البحث
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        try {
            const response = await mapService.geocode(searchQuery, 10);
            setSearchResults(response.data || []);
            if (response.data?.length > 0) {
                setMapCenter({ lat: parseFloat(response.data[0].lat), lng: parseFloat(response.data[0].lon) });
            }
        } catch (err) {
            setError('فشل البحث');
        }
    };

    const handleViewDriverLocation = useCallback((driver) => {
        setSelectedDriver(driver);
        const coords = getDriverCoords(driver);
        if (coords) {
            setMapCenter(coords);
            if (mapRef.current?.flyTo) mapRef.current.flyTo(coords.lng, coords.lat);
        }
    }, [getDriverCoords]);

    const resetFilters = () => {
        setDriverFilters({ showOnlineOnly: false, showAvailableOnly: false, minRating: 0 });
        setShowDriverFilters(false);
    };

    // تحميل الموقع تلقائياً عند فتح المتاجر
    useEffect(() => {
        if (activeTab === TABS.STORES && !userLocation) getUserLocation();
    }, [activeTab, getUserLocation, userLocation]);

    return (
        <Box sx={{ p: spacing.page }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={spacing.section} flexWrap="wrap" gap={2}>
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold">الخرائط والتتبع</Typography>
                <Badge color="primary" variant="dot" invisible={!isDriversFetching}>
                    <Button variant="contained" startIcon={<Refresh />} onClick={refreshAllData} size={isMobile ? "small" : "medium"}>
                        تحديث
                    </Button>
                </Badge>
            </Box>

            <Paper sx={{ mb: spacing.card }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant={isMobile ? "scrollable" : "standard"}>
                    <Tab icon={<LocalShipping />} iconPosition="start" label="المندوبين" value={TABS.DRIVERS} />
                    <Tab icon={<Directions />} iconPosition="start" label="الطلبات" value={TABS.ORDERS} />
                    <Tab icon={<Storefront />} iconPosition="start" label="المتاجر" value={TABS.STORES} />
                    <Tab icon={<Search />} iconPosition="start" label="البحث" value={TABS.SEARCH} />
                </Tabs>
            </Paper>

            {/* تبويب المندوبين */}
            {activeTab === TABS.DRIVERS && (
                <Grid container spacing={spacing.card}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: spacing.card }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Box>
                                    <Typography variant={isMobile ? "subtitle1" : "h6"}>مواقع المندوبين</Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {driversStats.online} متصل | {driversStats.available} متاح | إجمالي {driversStats.total}
                                    </Typography>
                                </Box>
                                <Box display="flex" gap={0.5}>
                                    <IconButton onClick={refreshAllData} size="small"><Refresh /></IconButton>
                                    <IconButton onClick={() => setShowDriverFilters(!showDriverFilters)} color={showDriverFilters ? 'primary' : 'default'} size="small"><FilterList /></IconButton>
                                    <IconButton onClick={() => mapRef.current?.zoomIn?.()} size="small"><ZoomIn /></IconButton>
                                    <IconButton onClick={() => mapRef.current?.zoomOut?.()} size="small"><ZoomOut /></IconButton>
                                    <IconButton onClick={getUserLocation} size="small"><MyLocation /></IconButton>
                                </Box>
                            </Box>

                            <Collapse in={showDriverFilters}>
                                <Paper sx={{ p: spacing.card, mb: 2, bgcolor: 'action.hover' }}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                        <Typography variant="subtitle2">فلترة المندوبين</Typography>
                                        <Button size="small" onClick={resetFilters} startIcon={<ClearAll />}>إعادة تعيين</Button>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel control={<Switch checked={driverFilters.showOnlineOnly} onChange={(e) => setDriverFilters({ ...driverFilters, showOnlineOnly: e.target.checked })} />} label="المتصلين فقط" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel control={<Switch checked={driverFilters.showAvailableOnly} onChange={(e) => setDriverFilters({ ...driverFilters, showAvailableOnly: e.target.checked })} />} label="المتاحين فقط" />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField select label="الحد الأدنى للتقييم" size="small" value={driverFilters.minRating} onChange={(e) => setDriverFilters({ ...driverFilters, minRating: Number(e.target.value) })}>
                                                <MenuItem value={0}>الكل</MenuItem>
                                                <MenuItem value={3}>3 نجوم فأكثر</MenuItem>
                                                <MenuItem value={4}>4 نجوم فأكثر</MenuItem>
                                            </TextField>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Collapse>

                            <DriverLocationMap
                                ref={mapRef}
                                drivers={filteredDriversList}
                                selectedDriver={selectedDriver}
                                onDriverSelect={handleViewDriverLocation}
                                height={showDriverFilters ? mapHeight - 80 : mapHeight}
                                center={mapCenter}
                                zoom={mapZoom}
                                onZoomChange={setMapZoom}
                            />
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: spacing.card, height: sidePanelHeight, overflow: 'auto' }}>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>قائمة المندوبين</Typography>
                            {driversLoading ? (
                                <Box>{[1, 2, 3].map(i => <Box key={i} sx={{ mb: 1, height: 70, bgcolor: 'action.hover', borderRadius: 1 }} />)}</Box>
                            ) : filteredDriversList.length === 0 ? (
                                <Alert severity="info">لا يوجد مندوبين مطابقين للفلتر</Alert>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {filteredDriversList.map((driver) => {
                                        const status = getDriverStatus(driver);
                                        const coords = getDriverCoords(driver);
                                        return (
                                            <ListItem
                                                key={driver._id}
                                                onClick={() => handleViewDriverLocation(driver)}
                                                sx={{ borderRadius: 1, mb: 1, cursor: 'pointer', borderLeft: `3px solid ${status.color}`, '&:hover': { bgcolor: 'action.hover' } }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={driver.image} sx={{ width: 40, height: 40 }}>{driver.name?.charAt(0)}</Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={driver.name}
                                                    secondary={
                                                        <Box>
                                                            <Chip label={`${status.icon} ${status.label}`} size="small" sx={{ height: 20, fontSize: 10, backgroundColor: `${status.color}20`, color: status.color }} />
                                                            {driver.rating > 0 && <Rating value={driver.rating} readOnly size="small" sx={{ mt: 0.5 }} />}
                                                            {coords && <Typography variant="caption" display="block" color="textSecondary">📍 {coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°</Typography>}
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* تبويب الطلبات */}
            {activeTab === TABS.ORDERS && (
                <Grid container spacing={spacing.card}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: spacing.card }}>
                            <OrderTrackingMap orderId={selectedOrder?._id} height={mapHeight} center={mapCenter} zoom={mapZoom} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: spacing.card, height: sidePanelHeight, overflow: 'auto' }}>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>الطلبات النشطة</Typography>
                            {ordersLoading ? (
                                <Box>{[1, 2].map(i => <Box key={i} sx={{ mb: 1, height: 80, bgcolor: 'action.hover', borderRadius: 1 }} />)}</Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {(activeOrders?.data?.orders || []).map(order => (
                                        <ListItem key={order._id} selected={selectedOrder?._id === order._id} onClick={() => setSelectedOrder(order)} sx={{ borderRadius: 1, mb: 1, cursor: 'pointer' }}>
                                            <ListItemText
                                                primary={`طلب #${order._id.slice(-6)}`}
                                                secondary={<Chip label={order.status === 'accepted' ? 'تم القبول' : order.status === 'ready' ? 'جاهز' : order.status === 'picked' ? 'قيد التوصيل' : order.status} size="small" color="info" />}
                                            />
                                        </ListItem>
                                    ))}
                                    {(activeOrders?.data?.orders || []).length === 0 && <Alert severity="info">لا توجد طلبات نشطة</Alert>}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* تبويب المتاجر */}
            {activeTab === TABS.STORES && (
                <Grid container spacing={spacing.card}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: spacing.card }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant={isMobile ? "subtitle1" : "h6"}>المتاجر القريبة</Typography>
                                <Box display="flex" gap={0.5}>
                                    <IconButton onClick={refreshAllData} size="small"><Refresh /></IconButton>
                                    <IconButton onClick={getUserLocation} disabled={loadingLocation} size="small">{loadingLocation ? <CircularProgress size={20} /> : <MyLocation />}</IconButton>
                                    <IconButton onClick={() => mapRef.current?.zoomIn?.()} size="small"><ZoomIn /></IconButton>
                                    <IconButton onClick={() => mapRef.current?.zoomOut?.()} size="small"><ZoomOut /></IconButton>
                                </Box>
                            </Box>
                            {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
                            <StoreMap ref={mapRef} stores={nearbyStores.length ? nearbyStores : (allStores?.data || [])} userLocation={userLocation} height={mapHeight} center={mapCenter} zoom={mapZoom} onZoomChange={setMapZoom} />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: spacing.card, height: sidePanelHeight, overflow: 'auto' }}>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>المتاجر القريبة</Typography>
                            {!userLocation ? (
                                <Alert severity="info">اضغط على أيقونة "موقعي" لعرض المتاجر</Alert>
                            ) : storesLoading ? (
                                <Box>{[1, 2, 3].map(i => <Box key={i} sx={{ mb: 1, height: 70, bgcolor: 'action.hover', borderRadius: 1 }} />)}</Box>
                            ) : (
                                <List sx={{ p: 0 }}>
                                    {(nearbyStores.length ? nearbyStores : (allStores?.data || [])).slice(0, 10).map(store => (
                                        <ListItem key={store._id} sx={{ borderRadius: 1, mb: 1 }}>
                                            <ListItemAvatar><Avatar src={store.logo}><Storefront /></Avatar></ListItemAvatar>
                                            <ListItemText primary={store.name} secondary={<><Rating value={store.averageRating || 0} readOnly size="small" /><Typography variant="caption" display="block">{store.category}</Typography></>} />
                                        </ListItem>
                                    ))}
                                    {nearbyStores.length === 0 && (allStores?.data || []).length === 0 && <Alert severity="info">لا توجد متاجر</Alert>}
                                </List>
                            )}
                            <Button fullWidth variant="outlined" startIcon={<Update />} onClick={handleUpdateStoresCoordinates} disabled={updatingStores} sx={{ mt: 2 }}>تحديث مواقع المتاجر</Button>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* تبويب البحث */}
            {activeTab === TABS.SEARCH && (
                <Paper sx={{ p: spacing.card }}>
                    <Typography variant={isMobile ? "subtitle1" : "h6"} gutterBottom>البحث عن موقع</Typography>
                    <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                        <TextField fullWidth label="ابحث عن موقع..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearch()} size={isMobile ? "small" : "medium"} sx={{ flex: 1 }} />
                        <Button variant="contained" startIcon={<Search />} onClick={handleSearch} size={isMobile ? "small" : "medium"}>بحث</Button>
                    </Box>
                    {searchResults.length > 0 && (
                        <List>
                            {searchResults.slice(0, 10).map((result, idx) => (
                                <ListItem key={idx} divider>
                                    <ListItemAvatar><Avatar><LocationOn /></Avatar></ListItemAvatar>
                                    <ListItemText primary={result.display_name || result.name} />
                                    <Button size="small" startIcon={<Directions />} onClick={() => { setMapCenter({ lat: parseFloat(result.lat), lng: parseFloat(result.lon) }); setActiveTab(TABS.STORES); }}>عرض</Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                    {searchResults.length === 0 && searchQuery && <Alert severity="info">لا توجد نتائج</Alert>}
                </Paper>
            )}

            {isMobile && (
                <Zoom in={true}>
                    <Fab color="primary" size="small" sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 1000 }} onClick={refreshAllData}>
                        <Refresh />
                    </Fab>
                </Zoom>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
}