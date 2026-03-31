import React, { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { useQuery, useQueryClient } from 'react-query';
import {
    Box,
    Paper,
    Typography,
    Grid,
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
    Fade,
    Skeleton,
    FormControlLabel,
    Switch,
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
    VisibilityOff,
} from '@mui/icons-material';
import { mapService, ordersService, storesService } from '../../api';
import DriverLocationMap from '../../components/Map/DriverLocationMap';
import OrderTrackingMap from '../../components/Map/OrderTrackingMap';
import StoreMap from '../../components/Map/StoreMap';

// تبويبات الصفحة
const TABS = {
    DRIVERS: 'drivers',
    ORDERS: 'orders',
    STORES: 'stores',
    SEARCH: 'search',
};

// ✅ مكون Wrapper لـ Tooltip مع دعم ref
const TooltipWrapper = forwardRef(({ title, children, ...props }, ref) => {
    // التحقق من صحة children
    if (!children) {
        return null;
    }
    
    // إذا كان العنصر يحتاج إلى ref، قم بتمريره
    if (React.isValidElement(children)) {
        // إذا كان العنصر معطلاً أو يحتاج إلى ref
        const childWithRef = React.cloneElement(children, { 
            ref: ref || children.ref 
        });
        return (
            <Tooltip title={title} {...props}>
                {childWithRef}
            </Tooltip>
        );
    }
    
    // للعناصر غير القابلة للـ ref (مثل النصوص)
    return (
        <Tooltip title={title} {...props}>
            <span style={{ display: 'inline-flex' }}>
                {children}
            </span>
        </Tooltip>
    );
});

TooltipWrapper.displayName = 'TooltipWrapper';

export default function MapPage() {
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
    const [autoRefreshInterval, setAutoRefreshInterval] = useState(10000);
    const [showDriverFilters, setShowDriverFilters] = useState(false);
    const [driverFilters, setDriverFilters] = useState({
        showOnlineOnly: false,
        showOfflineOnly: false,
        minRating: 0,
    });
    const [mapZoom, setMapZoom] = useState(12);
    const [mapCenter, setMapCenter] = useState(null);
    const [isMapReady, setIsMapReady] = useState(false);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);

    // جلب مواقع المندوبين
    const { 
        data: driversLocations, 
        isLoading: driversLoading, 
        refetch: refetchDrivers,
        isFetching: isDriversFetching,
    } = useQuery(
        'drivers-locations',
        () => mapService.getAllDriversLocations({ limit: 100 }),
        { 
            enabled: activeTab === TABS.DRIVERS, 
            refetchInterval: autoRefreshInterval > 0 ? autoRefreshInterval : false,
            onSuccess: () => setLastUpdateTime(new Date()),
        }
    );
    
    // جلب الطلبات النشطة
    const { data: activeOrders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery(
        'active-orders',
        () => ordersService.getOrders({
            page: 1,
            limit: 50,
            status: 'accepted,ready,picked,preparing,out_for_delivery'
        }),
        { 
            enabled: activeTab === TABS.ORDERS,
            refetchInterval: autoRefreshInterval > 0 ? autoRefreshInterval : false,
        }
    );

    // جلب المتاجر
    const { 
        data: allStores, 
        refetch: refetchStores,
        isLoading: storesLoading,
        isFetching: isStoresFetching,
    } = useQuery(
        'all-stores',
        () => storesService.getStores({ limit: 100 }),
        { 
            enabled: activeTab === TABS.STORES,
            refetchInterval: autoRefreshInterval > 0 ? autoRefreshInterval : false,
        }
    );

    // فلترة المندوبين
    const filteredDrivers = useCallback(() => {
        if (!driversLocations?.data?.drivers) return [];
        
        let drivers = [...driversLocations.data.drivers];
        
        if (driverFilters.showOnlineOnly) {
            drivers = drivers.filter(d => d.isOnline === true);
        }
        if (driverFilters.showOfflineOnly) {
            drivers = drivers.filter(d => d.isOnline === false);
        }
        if (driverFilters.minRating > 0) {
            drivers = drivers.filter(d => (d.rating || 0) >= driverFilters.minRating);
        }
        
        return drivers;
    }, [driversLocations, driverFilters]);

    // تحديث إحداثيات المتاجر
    const handleUpdateStoresCoordinates = async () => {
        try {
            setUpdatingStores(true);
            setSnackbar({ open: true, message: 'جاري تحديث مواقع المتاجر...', severity: 'info' });
            
            await storesService.updateStoreCoordinates();
            await refetchStores();
            
            if (userLocation) {
                await fetchNearbyStores(userLocation.lat, userLocation.lng);
            }
            
            setSnackbar({
                open: true,
                message: 'تم تحديث مواقع المتاجر بنجاح',
                severity: 'success'
            });
        } catch (error) {
            console.error('❌ Failed to update store coordinates:', error);
            setSnackbar({
                open: true,
                message: error.response?.data?.message || 'فشل تحديث مواقع المتاجر',
                severity: 'error'
            });
        } finally {
            setUpdatingStores(false);
        }
    };

    // تحديث جميع البيانات
    const refreshAllData = async () => {
        try {
            setSnackbar({ open: true, message: 'جاري تحديث البيانات...', severity: 'info' });
            
            const refreshPromises = [];
            
            if (activeTab === TABS.DRIVERS) {
                refreshPromises.push(refetchDrivers());
            } else if (activeTab === TABS.ORDERS) {
                refreshPromises.push(refetchOrders());
            } else if (activeTab === TABS.STORES) {
                refreshPromises.push(refetchStores());
                if (userLocation) {
                    refreshPromises.push(fetchNearbyStores(userLocation.lat, userLocation.lng));
                }
            }
            
            await Promise.all(refreshPromises);
            setLastUpdateTime(new Date());
            
            setSnackbar({
                open: true,
                message: 'تم تحديث البيانات بنجاح',
                severity: 'success'
            });
        } catch (error) {
            console.error('Refresh failed:', error);
            setSnackbar({
                open: true,
                message: 'فشل تحديث البيانات',
                severity: 'error'
            });
        }
    };

    // الحصول على موقع المستخدم
    const getUserLocation = useCallback(() => {
        setLoadingLocation(true);
        setError(null);

        if (!navigator.geolocation) {
            setError('المتصفح لا يدعم خدمات الموقع');
            setLoadingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                setUserLocation(location);
                setMapCenter(location);
                setLoadingLocation(false);
                
                if (activeTab === TABS.STORES) {
                    fetchNearbyStores(location.lat, location.lng);
                }
                
                setSnackbar({
                    open: true,
                    message: 'تم تحديد موقعك بنجاح',
                    severity: 'success'
                });
            },
            (err) => {
                console.error('Geolocation error:', err);
                setError('فشل الحصول على الموقع. يرجى تفعيل خدمات الموقع.');
                setLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, [activeTab]);

    // جلب المتاجر القريبة
    const fetchNearbyStores = async (lat, lng) => {
        try {
            const response = await mapService.getStoresMap({ lat, lng, radius: 5000 });
            setNearbyStores(response.data?.stores || []);
        } catch (err) {
            console.error('Failed to fetch nearby stores:', err);
        }
    };

    // البحث عن موقع
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        try {
            const response = await mapService.geocode(searchQuery, 10);
            setSearchResults(response.data || []);
            
            if (response.data?.length > 0) {
                const firstResult = response.data[0];
                setMapCenter({
                    lat: parseFloat(firstResult.lat),
                    lng: parseFloat(firstResult.lon),
                });
            }
        } catch (err) {
            console.error('Search failed:', err);
            setError('فشل البحث عن الموقع');
        }
    };
    
    // تتبع طلب
    const handleTrackOrder = async (order) => {
        setSelectedOrder(order);
        try {
            const response = await mapService.getOrderRoute(order._id);
            console.log('Order route:', response.data);
        } catch (err) {
            console.error('Failed to get order route:', err);
        }
    };
    
    // عرض موقع مندوب
    const handleViewDriverLocation = (driver) => {
        setSelectedDriver(driver);
        if (driver.location?.coordinates && driver.location.coordinates.length >= 2) {
            setMapCenter({
                lat: driver.location.coordinates[1],
                lng: driver.location.coordinates[0],
            });
        }
    };
    
    // اختيار متجر
    const handleStoreSelect = (store) => {
        console.log('Selected store:', store);
    };

    // التحكم في تكبير الخريطة
    const handleZoomIn = () => {
        if (mapRef.current?.zoomIn) {
            mapRef.current.zoomIn();
        }
    };
    
    const handleZoomOut = () => {
        if (mapRef.current?.zoomOut) {
            mapRef.current.zoomOut();
        }
    };

    // إعادة تعيين الفلاتر
    const resetFilters = () => {
        setDriverFilters({
            showOnlineOnly: false,
            showOfflineOnly: false,
            minRating: 0,
        });
        setShowDriverFilters(false);
        setSnackbar({
            open: true,
            message: 'تم إعادة تعيين الفلاتر',
            severity: 'info'
        });
    };

    // حساب عدد المتاجر بدون إحداثيات
    const storesList = nearbyStores.length > 0 ? nearbyStores : (allStores?.data || []);
    const storesWithoutCoords = storesList.filter(store => {
        return !store.address?.latitude && !store.address?.longitude && !store.location?.coordinates;
    });
    
    const driversList = filteredDrivers();
    const onlineDriversCount = driversList.filter(d => d.isOnline).length;
    const offlineDriversCount = driversList.filter(d => !d.isOnline).length;

    // تحميل الموقع تلقائياً
    useEffect(() => {
        if (activeTab === TABS.STORES && !userLocation) {
            getUserLocation();
        }
    }, [activeTab, getUserLocation, userLocation]);

    return (
        <Box dir="rtl" sx={{ p: 3, position: 'relative' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Typography variant="h5" fontWeight="bold">
                    الخرائط والتتبع
                </Typography>
                
                {/* زر التحديث الرئيسي - بدون TooltipWrapper لتجنب المشاكل */}
                <Badge 
                    color="primary" 
                    variant="dot" 
                    invisible={!isDriversFetching && !isStoresFetching}
                >
                    <Button
                        variant="contained"
                        startIcon={<Refresh />}
                        onClick={refreshAllData}
                        disabled={isDriversFetching || isStoresFetching}
                        sx={{ textTransform: 'none' }}
                    >
                        {isDriversFetching || isStoresFetching ? (
                            <CircularProgress size={24} />
                        ) : (
                            'تحديث الكل'
                        )}
                    </Button>
                </Badge>
            </Box>

            {/* تبويبات */}
            <Paper sx={{ mb: 3 }}>
                <Box display="flex" borderBottom={1} borderColor="divider" sx={{ overflowX: 'auto' }}>
                    <Button
                        onClick={() => setActiveTab(TABS.DRIVERS)}
                        sx={{
                            py: 2,
                            px: 3,
                            borderRadius: 0,
                            borderBottom: activeTab === TABS.DRIVERS ? 2 : 0,
                            borderColor: 'primary.main',
                            color: activeTab === TABS.DRIVERS ? 'primary.main' : 'text.secondary',
                            whiteSpace: 'nowrap',
                        }}
                        startIcon={<LocalShipping />}
                    >
                        مواقع المندوبين
                        {driversLocations?.data?.drivers && (
                            <Chip 
                                size="small" 
                                label={driversLocations.data.drivers.length} 
                                sx={{ ml: 1, height: 20 }}
                            />
                        )}
                    </Button>
                    <Button
                        onClick={() => setActiveTab(TABS.ORDERS)}
                        sx={{
                            py: 2,
                            px: 3,
                            borderRadius: 0,
                            borderBottom: activeTab === TABS.ORDERS ? 2 : 0,
                            borderColor: 'primary.main',
                            color: activeTab === TABS.ORDERS ? 'primary.main' : 'text.secondary',
                            whiteSpace: 'nowrap',
                        }}
                        startIcon={<Directions />}
                    >
                        تتبع الطلبات
                        {activeOrders?.data?.orders && (
                            <Chip 
                                size="small" 
                                label={activeOrders.data.orders.length} 
                                sx={{ ml: 1, height: 20 }}
                            />
                        )}
                    </Button>
                    <Button
                        onClick={() => setActiveTab(TABS.STORES)}
                        sx={{
                            py: 2,
                            px: 3,
                            borderRadius: 0,
                            borderBottom: activeTab === TABS.STORES ? 2 : 0,
                            borderColor: 'primary.main',
                            color: activeTab === TABS.STORES ? 'primary.main' : 'text.secondary',
                            whiteSpace: 'nowrap',
                        }}
                        startIcon={<Storefront />}
                    >
                        المتاجر القريبة
                    </Button>
                    <Button
                        onClick={() => setActiveTab(TABS.SEARCH)}
                        sx={{
                            py: 2,
                            px: 3,
                            borderRadius: 0,
                            borderBottom: activeTab === TABS.SEARCH ? 2 : 0,
                            borderColor: 'primary.main',
                            color: activeTab === TABS.SEARCH ? 'primary.main' : 'text.secondary',
                            whiteSpace: 'nowrap',
                        }}
                        startIcon={<Search />}
                    >
                        البحث
                    </Button>
                </Box>
            </Paper>

            {/* تبويب المندوبين - استخدام Tooltip مباشرة بدلاً من TooltipWrapper */}
            {activeTab === TABS.DRIVERS && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: 650, position: 'relative' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                                <Typography variant="h6">
                                    مواقع المندوبين
                                    <Chip 
                                        size="small" 
                                        label={`${onlineDriversCount} متصل / ${offlineDriversCount} غير متصل`}
                                        sx={{ ml: 2 }}
                                    />
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <Tooltip title="تحديث الخريطة">
                                        <span>
                                            <IconButton 
                                                onClick={refreshAllData} 
                                                disabled={driversLoading}
                                                size="small"
                                            >
                                                <Refresh />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    
                                    <Tooltip title="الفلاتر">
                                        <span>
                                            <IconButton 
                                                onClick={() => setShowDriverFilters(!showDriverFilters)}
                                                color={showDriverFilters ? 'primary' : 'default'}
                                                size="small"
                                            >
                                                <FilterList />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    
                                    <Tooltip title="تكبير">
                                        <IconButton onClick={handleZoomIn} size="small">
                                            <ZoomIn />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="تصغير">
                                        <IconButton onClick={handleZoomOut} size="small">
                                            <ZoomOut />
                                        </IconButton>
                                    </Tooltip>
                                    
                                    <Tooltip title="موقعي">
                                        <IconButton onClick={getUserLocation} size="small">
                                            <MyLocation />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            
                            {/* فلتر المندوبين */}
                            {showDriverFilters && (
                                <Fade in={showDriverFilters}>
                                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                            <Typography variant="subtitle2">فلترة المندوبين</Typography>
                                            <Button size="small" onClick={resetFilters} startIcon={<ClearAll />}>
                                                إعادة تعيين
                                            </Button>
                                        </Box>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={driverFilters.showOnlineOnly}
                                                            onChange={(e) => setDriverFilters({
                                                                ...driverFilters,
                                                                showOnlineOnly: e.target.checked,
                                                                showOfflineOnly: e.target.checked ? false : driverFilters.showOfflineOnly,
                                                            })}
                                                        />
                                                    }
                                                    label="المندوبين المتصلين فقط"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={driverFilters.showOfflineOnly}
                                                            onChange={(e) => setDriverFilters({
                                                                ...driverFilters,
                                                                showOfflineOnly: e.target.checked,
                                                                showOnlineOnly: e.target.checked ? false : driverFilters.showOnlineOnly,
                                                            })}
                                                        />
                                                    }
                                                    label="المندوبين غير المتصلين"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Fade>
                            )}
                            
                            <DriverLocationMap
                                ref={mapRef}
                                drivers={driversList}
                                selectedDriver={selectedDriver}
                                onDriverSelect={handleViewDriverLocation}
                                height={showDriverFilters ? 460 : 520}
                                center={mapCenter}
                                zoom={mapZoom}
                                onZoomChange={setMapZoom}
                                onMapReady={() => setIsMapReady(true)}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: 650, overflow: 'auto' }}>
                            <Typography variant="h6" gutterBottom>
                                قائمة المندوبين
                            </Typography>
                            {driversLoading ? (
                                <Box>
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} variant="rectangular" height={72} sx={{ mb: 1, borderRadius: 1 }} />
                                    ))}
                                </Box>
                            ) : (
                                <List>
                                    {driversList.map((driver) => (
                                        <ListItem
                                            key={driver.id}
                                            component="div"
                                            selected={selectedDriver?.id === driver.id}
                                            onClick={() => handleViewDriverLocation(driver)}
                                            sx={{
                                                borderRadius: 1,
                                                mb: 1,
                                                cursor: 'pointer',
                                                bgcolor: selectedDriver?.id === driver.id ? 'action.selected' : 'transparent',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateX(-4px)',
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Avatar src={driver.avatar}>
                                                    {driver.name?.charAt(0)}
                                                </Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                                                        {driver.name}
                                                        {driver.rating && (
                                                            <Rating value={driver.rating} readOnly size="small" />
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box component="span">
                                                        <Chip
                                                            label={driver.isOnline ? '🟢 متصل' : '⚫ غير متصل'}
                                                            size="small"
                                                            color={driver.isOnline ? 'success' : 'default'}
                                                            sx={{ height: 20, fontSize: 11 }}
                                                        />
                                                        {driver.location && (
                                                            <Typography variant="caption" display="block" color="textSecondary" mt={0.5}>
                                                                آخر تحديث: {new Date(driver.location.updatedAt).toLocaleTimeString()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                    {driversList.length === 0 && (
                                        <Alert severity="info">
                                            لا يوجد مندوبين مطابقين للفلتر المحدد
                                        </Alert>
                                    )}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* تبويب الطلبات */}
            {activeTab === TABS.ORDERS && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: 650 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                                <Typography variant="h6">
                                    تتبع الطلب {selectedOrder && `#${selectedOrder._id.slice(-6)}`}
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <Tooltip title="تحديث الخريطة">
                                        <span>
                                            <IconButton onClick={refreshAllData} size="small">
                                                <Refresh />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="تكبير">
                                        <IconButton onClick={handleZoomIn} size="small">
                                            <ZoomIn />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="تصغير">
                                        <IconButton onClick={handleZoomOut} size="small">
                                            <ZoomOut />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            <OrderTrackingMap
                                orderId={selectedOrder?._id}
                                height={560}
                                center={mapCenter}
                                zoom={mapZoom}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: 650, overflow: 'auto' }}>
                            <Typography variant="h6" gutterBottom>
                                الطلبات النشطة
                            </Typography>
                            {ordersLoading ? (
                                <Box>
                                    {[1, 2, 3].map(i => (
                                        <Skeleton key={i} variant="rectangular" height={100} sx={{ mb: 1, borderRadius: 1 }} />
                                    ))}
                                </Box>
                            ) : (
                                <List>
                                    {(activeOrders?.data?.orders || []).map((order) => (
                                        <ListItem
                                            key={order._id}
                                            component="div"
                                            selected={selectedOrder?._id === order._id}
                                            onClick={() => handleTrackOrder(order)}
                                            sx={{ 
                                                borderRadius: 1, 
                                                mb: 1,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                '&:hover': {
                                                    transform: 'translateX(-4px)',
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <ListItemText
                                                primary={`طلب #${order._id.slice(-6)}`}
                                                secondary={
                                                    <Box component="span">
                                                        <Typography variant="caption" display="block">
                                                            {order.store?.name || order.storeId}
                                                        </Typography>
                                                        <Chip
                                                            label={order.status === 'accepted' ? 'تم القبول' : 
                                                                   order.status === 'preparing' ? 'قيد التحضير' :
                                                                   order.status === 'ready' ? 'جاهز' :
                                                                   order.status === 'out_for_delivery' ? 'قيد التوصيل' : order.status}
                                                            size="small"
                                                            color={order.status === 'out_for_delivery' ? 'warning' : 'info'}
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* تبويب المتاجر */}
            {activeTab === TABS.STORES && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 2, height: 650, position: 'relative' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
                                <Typography variant="h6">
                                    المتاجر القريبة
                                </Typography>
                                <Box display="flex" gap={1}>
                                    <Tooltip title="تحديث الخريطة">
                                        <span>
                                            <IconButton onClick={refreshAllData} disabled={isStoresFetching} size="small">
                                                <Refresh />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    {storesWithoutCoords.length > 0 && (
                                        <Tooltip title={`تحديث مواقع ${storesWithoutCoords.length} متجر`}>
                                            <span>
                                                <IconButton 
                                                    onClick={handleUpdateStoresCoordinates} 
                                                    disabled={updatingStores}
                                                    size="small"
                                                    color="warning"
                                                >
                                                    <Update />
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="موقعي">
                                        <span>
                                            <IconButton 
                                                onClick={getUserLocation} 
                                                disabled={loadingLocation}
                                                size="small"
                                            >
                                                {loadingLocation ? <CircularProgress size={20} /> : <MyLocation />}
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                    <Tooltip title="تكبير">
                                        <IconButton onClick={handleZoomIn} size="small">
                                            <ZoomIn />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="تصغير">
                                        <IconButton onClick={handleZoomOut} size="small">
                                            <ZoomOut />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>
                            
                            {error && (
                                <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
                                    {error}
                                </Alert>
                            )}
                            
                            <StoreMap
                                ref={mapRef}
                                stores={storesList}
                                userLocation={userLocation}
                                onStoreSelect={handleStoreSelect}
                                onRefresh={handleUpdateStoresCoordinates}
                                height={560}
                                center={mapCenter}
                                zoom={mapZoom}
                                onZoomChange={setMapZoom}
                            />
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 2, height: 650, overflow: 'auto' }}>
                            <Typography variant="h6" gutterBottom>
                                المتاجر القريبة
                                {storesWithoutCoords.length > 0 && (
                                    <Chip 
                                        size="small" 
                                        label={`${storesWithoutCoords.length} بدون إحداثيات`}
                                        color="warning"
                                        sx={{ ml: 1 }}
                                    />
                                )}
                            </Typography>
                            
                            {!userLocation ? (
                                <Alert severity="info" sx={{ mb: 2 }}>
                                    اضغط على أيقونة "موقعي" لعرض المتاجر القريبة منك
                                </Alert>
                            ) : storesLoading ? (
                                <Box>
                                    {[1, 2, 3, 4].map(i => (
                                        <Skeleton key={i} variant="rectangular" height={80} sx={{ mb: 1, borderRadius: 1 }} />
                                    ))}
                                </Box>
                            ) : (
                                <List>
                                    {storesList.slice(0, 10).map((store) => {
                                        const hasCoords = store.address?.latitude || store.location?.coordinates;
                                        return (
                                            <ListItem 
                                                key={store._id} 
                                                sx={{ 
                                                    borderRadius: 1, 
                                                    mb: 1,
                                                    opacity: hasCoords ? 1 : 0.6,
                                                    bgcolor: !hasCoords ? 'action.hover' : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        transform: 'translateX(-4px)',
                                                        bgcolor: 'action.selected',
                                                    },
                                                }}
                                            >
                                                <ListItemAvatar>
                                                    <Avatar src={store.logo}>
                                                        <Storefront />
                                                    </Avatar>
                                                </ListItemAvatar>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            {store.name}
                                                            {!hasCoords && (
                                                                <Tooltip title="هذا المتجر ليس لديه إحداثيات دقيقة">
                                                                    <VisibilityOff fontSize="small" color="warning" />
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    }
                                                    secondary={
                                                        <Box>
                                                            <Rating 
                                                                value={store.averageRating || 0} 
                                                                readOnly 
                                                                size="small" 
                                                            />
                                                            <Typography variant="caption" display="block" color="textSecondary">
                                                                {store.category} 
                                                                {store.distance && ` • ${store.distance.toFixed(1)} كم`}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                />
                                            </ListItem>
                                        );
                                    })}
                                    {storesList.length === 0 && (
                                        <Alert severity="info">
                                            لا توجد متاجر قريبة
                                        </Alert>
                                    )}
                                </List>
                            )}
                            
                            {storesWithoutCoords.length > 0 && (
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    يوجد {storesWithoutCoords.length} متجر بدون إحداثيات دقيقة.
                                    <Button 
                                        size="small" 
                                        onClick={handleUpdateStoresCoordinates}
                                        disabled={updatingStores}
                                        sx={{ ml: 1 }}
                                    >
                                        {updatingStores ? <CircularProgress size={20} /> : 'تحديث'}
                                    </Button>
                                </Alert>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* تبويب البحث */}
            {activeTab === TABS.SEARCH && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                        البحث عن موقع
                    </Typography>
                    <Box display="flex" gap={2} mb={3} flexWrap="wrap">
                        <TextField
                            fullWidth
                            label="ابحث عن موقع، شارع، مدينة..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            sx={{ flex: 1 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={<Search />}
                            onClick={handleSearch}
                        >
                            بحث
                        </Button>
                    </Box>

                    {searchResults.length > 0 && (
                        <List>
                            {searchResults.map((result, index) => (
                                <ListItem key={index} divider>
                                    <ListItemAvatar>
                                        <Avatar>
                                            <LocationOn />
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={result.display_name || result.name}
                                        secondary={result.type}
                                    />
                                    <Button
                                        size="small"
                                        startIcon={<Directions />}
                                        onClick={() => {
                                            setMapCenter({
                                                lat: parseFloat(result.lat),
                                                lng: parseFloat(result.lon),
                                            });
                                            setActiveTab(TABS.STORES);
                                        }}
                                    >
                                        عرض على الخريطة
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Paper>
            )}

            {/* Floating Action Button */}
            <Zoom in={true}>
                <Fab
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 24,
                        right: 24,
                        zIndex: 1000,
                    }}
                    onClick={refreshAllData}
                >
                    <Refresh />
                </Fab>
            </Zoom>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={() => setSnackbar({ ...snackbar, open: false })} 
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}