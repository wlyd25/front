// components/Map/StoreMap.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const StoreMap = forwardRef(({ 
    stores = [], 
    userLocation, 
    onStoreSelect, 
    onRefresh,
    height = 500,
    center,
    zoom,
    onZoomChange 
}, ref) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef([]);

    // التحقق من صحة الإحداثيات
    const isValidCoordinate = (lat, lng) => {
        return (
            lat !== undefined && 
            lng !== undefined && 
            !isNaN(lat) && 
            !isNaN(lng) && 
            lat !== null && 
            lng !== null &&
            Math.abs(lat) <= 90 &&
            Math.abs(lng) <= 180
        );
    };

    // الحصول على إحداثيات المتجر بشكل آمن
    const getStoreCoordinates = (store) => {
        try {
            // محاولة الحصول من address.latitude/longitude
            if (store.address?.latitude && store.address?.longitude) {
                return {
                    lat: parseFloat(store.address.latitude),
                    lng: parseFloat(store.address.longitude),
                };
            }
            
            // محاولة الحصول من location.coordinates (GeoJSON format)
            if (store.location?.coordinates && Array.isArray(store.location.coordinates)) {
                const coords = store.location.coordinates;
                if (coords.length >= 2 && isValidCoordinate(coords[1], coords[0])) {
                    return {
                        lat: parseFloat(coords[1]),
                        lng: parseFloat(coords[0]),
                    };
                }
            }
            
            // محاولة الحصول من lat/lng مباشرة
            if (store.lat && store.lng && isValidCoordinate(store.lat, store.lng)) {
                return {
                    lat: parseFloat(store.lat),
                    lng: parseFloat(store.lng),
                };
            }
            
            return null;
        } catch (error) {
            console.error('Error getting store coordinates:', error);
            return null;
        }
    };

    // تصفية المتاجر ذات الإحداثيات الصحيحة فقط
    const getValidStores = () => {
        return stores.filter(store => {
            const coords = getStoreCoordinates(store);
            return coords !== null;
        });
    };

    useImperativeHandle(ref, () => ({
        zoomIn: () => {
            if (map.current) map.current.zoomIn();
        },
        zoomOut: () => {
            if (map.current) map.current.zoomOut();
        },
        flyTo: (lng, lat) => {
            if (map.current && isValidCoordinate(lat, lng)) {
                map.current.flyTo({ center: [lng, lat], zoom: 14 });
            }
        }
    }));

    useEffect(() => {
        if (!mapContainer.current) return;

        // المركز الافتراضي مع التحقق من الصحة
        let defaultCenter = [2.1254, 13.5127]; 
        
        if (center && isValidCoordinate(center.lat, center.lng)) {
            defaultCenter = [center.lng, center.lat];
        } else if (userLocation && isValidCoordinate(userLocation.lat, userLocation.lng)) {
            defaultCenter = [userLocation.lng, userLocation.lat];
        }

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/streets-v12',
            center: defaultCenter,
            zoom: zoom || 12,
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        map.current.addControl(new mapboxgl.FullscreenControl());

        if (onZoomChange) {
            map.current.on('zoomend', () => {
                onZoomChange(map.current.getZoom());
            });
        }

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    // إضافة علامات المتاجر
    useEffect(() => {
        if (!map.current) return;

        // إزالة العلامات القديمة
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        const validStores = getValidStores();

        validStores.forEach(store => {
            const coords = getStoreCoordinates(store);
            if (!coords) return;

            const popup = new mapboxgl.Popup({ offset: 25 })
                .setHTML(`
                    <div style="padding: 8px; min-width: 150px; direction: rtl;">
                        <h4 style="margin: 0 0 5px 0;">${store.name || 'متجر'}</h4>
                        <p style="margin: 5px 0; font-size: 12px; color: #666;">
                            ${store.category || ''}
                        </p>
                        ${store.averageRating ? `
                            <p style="margin: 5px 0; font-size: 12px;">
                                ⭐ ${store.averageRating.toFixed(1)} / 5
                            </p>
                        ` : ''}
                        <button 
                            onclick="window.selectStore('${store._id}')"
                            style="
                                margin-top: 5px;
                                padding: 4px 12px;
                                background: #1976d2;
                                color: white;
                                border: none;
                                border-radius: 4px;
                                cursor: pointer;
                                font-size: 12px;
                            "
                        >
                            عرض التفاصيل
                        </button>
                    </div>
                `);

            const marker = new mapboxgl.Marker({ color: '#FF5722' })
                .setLngLat([coords.lng, coords.lat])
                .setPopup(popup)
                .addTo(map.current);

            marker.getElement().addEventListener('click', () => {
                if (onStoreSelect) onStoreSelect(store);
            });

            markers.current.push(marker);
        });

        // ربط الدالة العالمية
        window.selectStore = (storeId) => {
            const store = stores.find(s => s._id === storeId);
            if (store && onStoreSelect) onStoreSelect(store);
        };

    }, [stores, onStoreSelect]);

    // تحديث موقع المستخدم
    useEffect(() => {
        if (!map.current || !userLocation) return;
        
        if (isValidCoordinate(userLocation.lat, userLocation.lng)) {
            // إضافة علامة موقع المستخدم
            if (markers.current.userMarker) {
                markers.current.userMarker.remove();
            }

            const userMarker = new mapboxgl.Marker({ color: '#2196F3' })
                .setLngLat([userLocation.lng, userLocation.lat])
                .setPopup(new mapboxgl.Popup().setHTML('<strong>موقعك الحالي</strong>'))
                .addTo(map.current);

            markers.current.userMarker = userMarker;
        }
    }, [userLocation]);

    return (
        <div 
            ref={mapContainer} 
            style={{ 
                width: '100%', 
                height: `${height}px`,
                borderRadius: '8px',
                overflow: 'hidden'
            }} 
        />
    );
});

StoreMap.displayName = 'StoreMap';

export default StoreMap;