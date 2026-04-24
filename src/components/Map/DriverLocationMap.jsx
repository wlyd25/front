// src/components/Map/DriverLocationMap.jsx - النسخة النهائية

import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const DriverLocationMap = forwardRef(({
    drivers = [],
    selectedDriver,
    onDriverSelect,
    onDriverClick,
    height = 500,
    center,
    zoom,
    onZoomChange,
    onMapReady,
    showUserLocation = true,
    userLocation = null,
    refreshInterval = 30000,
    fitBoundsOnLoad = true,
}, ref) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markers = useRef([]);  // ✅ تغيير إلى مصفوفة مثل StoreMap
    const userMarker = useRef(null);
    const refreshIntervalRef = useRef(null);

    // ✅ الحصول على إحداثيات المندوب (نفس طريقة StoreMap)
    const getDriverCoordinates = useCallback((driver) => {
        if (!driver) return null;
        
        // نفس تنسيق StoreMap
        const coords = driver?.driverInfo?.currentLocation?.coordinates;
        if (coords && Array.isArray(coords) && coords.length >= 2) {
            return {
                lng: parseFloat(coords[0]),
                lat: parseFloat(coords[1])
            };
        }
        
        const locationCoords = driver?.location?.coordinates;
        if (locationCoords && Array.isArray(locationCoords) && locationCoords.length >= 2) {
            return {
                lng: parseFloat(locationCoords[0]),
                lat: parseFloat(locationCoords[1])
            };
        }
        
        return null;
    }, []);

    // ✅ الحصول على لون الحالة (مبسط)
    const getDriverStatusColor = useCallback((driver) => {
        if (!driver.isActive) return '#F44336';      // أحمر - معطل
        if (!driver.isOnline) return '#9E9E9E';       // رمادي - غير متصل
        if (driver.currentOrder) return '#FF9800';    // برتقالي - مشغول
        if (driver.driverInfo?.isAvailable) return '#4CAF50'; // أخضر - متاح
        return '#FFC107'; // أصفر
    }, []);

    // ✅ إنشاء عنصر العلامة (مثل StoreMap تماماً)
    const createMarkerElement = useCallback((driver, color) => {
        const driverName = driver.name || 'مندوب';
        const initial = driverName.charAt(0).toUpperCase();
        const imageUrl = driver.image || driver.avatar;
        
        const el = document.createElement('div');
        el.className = 'driver-marker';
        el.style.cssText = `
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: ${color};
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.2s;
        `;
        
        // صورة أو حرف
        if (imageUrl && imageUrl.startsWith('http')) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 50%;
            `;
            img.onerror = () => {
                el.innerHTML = `<span style="font-size: 20px; font-weight: bold; color: white;">${initial}</span>`;
            };
            el.appendChild(img);
        } else {
            el.innerHTML = `<span style="font-size: 20px; font-weight: bold; color: white;">${initial}</span>`;
        }
        
        // نقطة الحالة
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            bottom: -2px;
            right: -2px;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: ${color};
            border: 2px solid white;
        `;
        el.appendChild(dot);
        
        return el;
    }, []);

    // ✅ تحديث العلامات (مثل StoreMap تماماً)
    const updateMarkers = useCallback(() => {
        if (!map.current) return;
        
        // إزالة العلامات القديمة
        markers.current.forEach(marker => marker.remove());
        markers.current = [];
        
        // إضافة العلامات الجديدة
        const validDrivers = drivers.filter(d => getDriverCoordinates(d) !== null);
        
        validDrivers.forEach(driver => {
            const coords = getDriverCoordinates(driver);
            if (!coords) return;
            
            const color = getDriverStatusColor(driver);
            const markerElement = createMarkerElement(driver, color);
            
            // محتوى البوب اب
            const popupContent = `
                <div style="padding: 12px; direction: rtl; min-width: 200px;">
                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                        <img 
                            src="${driver.image || ''}" 
                            style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" 
                            onerror="this.style.display='none'"
                        />
                        <div>
                            <strong style="font-size: 14px;">${driver.name || 'مندوب'}</strong><br/>
                            <span style="font-size: 11px; color: #666;">${driver.phone || ''}</span>
                        </div>
                    </div>
                    <div style="font-size: 11px; margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee;">
                        ⭐ التقييم: ${driver.rating || 'جديد'}
                    </div>
                </div>
            `;
            
            const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
                .setHTML(popupContent);
            
            const marker = new mapboxgl.Marker({ element: markerElement })
                .setLngLat([coords.lng, coords.lat])
                .setPopup(popup)
                .addTo(map.current);
            
            // إضافة حدث النقر
            marker.getElement().addEventListener('click', () => {
                if (onDriverClick) onDriverClick(driver);
                if (onDriverSelect) onDriverSelect(driver);
            });
            
            markers.current.push(marker);
        });
        
        // ضبط حدود الخريطة في أول تحميل
        if (fitBoundsOnLoad && validDrivers.length > 0) {
            const bounds = new mapboxgl.LngLatBounds();
            validDrivers.forEach(driver => {
                const coords = getDriverCoordinates(driver);
                if (coords) bounds.extend([coords.lng, coords.lat]);
            });
            if (!bounds.isEmpty()) {
                map.current.fitBounds(bounds, { padding: 50 });
            }
        }
    }, [drivers, getDriverCoordinates, getDriverStatusColor, createMarkerElement, onDriverSelect, onDriverClick, fitBoundsOnLoad]);

    // ✅ تحديث موقع المستخدم
    const updateUserLocation = useCallback(() => {
        if (!map.current) return;
        
        if (userMarker.current) {
            userMarker.current.remove();
            userMarker.current = null;
        }
        
        if (showUserLocation && userLocation && userLocation.lat && userLocation.lng) {
            userMarker.current = new mapboxgl.Marker({ color: '#2196F3' })
                .setLngLat([userLocation.lng, userLocation.lat])
                .setPopup(new mapboxgl.Popup({ closeButton: false }).setHTML('<div style="padding: 8px;"><strong>📍 موقعك الحالي</strong></div>'))
                .addTo(map.current);
        }
    }, [showUserLocation, userLocation]);

    // ✅ دوال التحكم
    useImperativeHandle(ref, () => ({
        zoomIn: () => map.current?.zoomIn(),
        zoomOut: () => map.current?.zoomOut(),
        fitBounds: () => {
            const validDrivers = drivers.filter(d => getDriverCoordinates(d) !== null);
            if (validDrivers.length === 0) return;
            const bounds = new mapboxgl.LngLatBounds();
            validDrivers.forEach(driver => {
                const coords = getDriverCoordinates(driver);
                if (coords) bounds.extend([coords.lng, coords.lat]);
            });
            map.current?.fitBounds(bounds, { padding: 50 });
        },
        refresh: () => updateMarkers(),
        flyTo: (lng, lat) => map.current?.flyTo({ center: [lng, lat], zoom: 14 }),
        getMap: () => map.current,
    }));

    // ✅ تهيئة الخريطة
    useEffect(() => {
        if (!mapContainer.current || map.current) return;
        
        // المركز الافتراضي
        let defaultCenter = [2.1254, 13.5127]; // نيامي
        
        if (center?.lng && center?.lat) {
            defaultCenter = [center.lng, center.lat];
        } else if (userLocation?.lng && userLocation?.lat) {
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
            map.current.on('zoomend', () => onZoomChange(map.current.getZoom()));
        }
        
        map.current.on('load', () => {
            if (onMapReady) onMapReady(map.current);
        });
        
        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
            markers.current.forEach(m => m.remove());
            markers.current = [];
            if (userMarker.current) userMarker.current.remove();
            if (map.current) { map.current.remove(); map.current = null; }
        };
    }, []);

    // ✅ تحديث العلامات عند تغيير المندوبين
    useEffect(() => {
        if (!map.current) return;
        updateMarkers();
        
        if (refreshInterval > 0) {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
            refreshIntervalRef.current = setInterval(() => {
                if (map.current) updateMarkers();
            }, refreshInterval);
        }
        
        return () => {
            if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
        };
    }, [drivers, updateMarkers, refreshInterval]);

    // ✅ تحديث موقع المستخدم
    useEffect(() => {
        if (!map.current) return;
        updateUserLocation();
    }, [userLocation, showUserLocation, updateUserLocation]);

    // ✅ التكبير للمندوب المحدد
    useEffect(() => {
        if (!map.current || !selectedDriver) return;
        const coords = getDriverCoordinates(selectedDriver);
        if (coords) {
            map.current.flyTo({ center: [coords.lng, coords.lat], zoom: 14 });
        }
    }, [selectedDriver, getDriverCoordinates]);

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

DriverLocationMap.displayName = 'DriverLocationMap';

export default DriverLocationMap;