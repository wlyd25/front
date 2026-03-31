// components/Map/OrderTrackingMap.jsx
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const OrderTrackingMap = forwardRef(({ 
    orderId, 
    height = 500,
    center,
    zoom,
    onZoomChange 
}, ref) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const routeLayer = useRef(null);

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

    useImperativeHandle(ref, () => ({
        zoomIn: () => {
            if (map.current) map.current.zoomIn();
        },
        zoomOut: () => {
            if (map.current) map.current.zoomOut();
        },
        addRoute: (coordinates) => {
            if (!map.current) return;
            
            const validCoords = coordinates.filter(coord => 
                isValidCoordinate(coord[1], coord[0])
            );
            
            if (validCoords.length > 0 && map.current.getSource('route')) {
                map.current.getSource('route').setData({
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: validCoords
                    }
                });
            }
        }
    }));

    useEffect(() => {
        if (!mapContainer.current) return;

        let defaultCenter = [2.1254, 13.5127];
        
        if (center && isValidCoordinate(center.lat, center.lng)) {
            defaultCenter = [center.lng, center.lat];
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

        map.current.on('load', () => {
            // إضافة طبقة المسار
            map.current.addSource('route', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: {},
                    geometry: {
                        type: 'LineString',
                        coordinates: []
                    }
                }
            });

            map.current.addLayer({
                id: 'route',
                type: 'line',
                source: 'route',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#3887be',
                    'line-width': 5,
                    'line-opacity': 0.75
                }
            });
        });

        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    // جلب مسار الطلب
    useEffect(() => {
        if (!orderId || !map.current) return;

        const fetchOrderRoute = async () => {
            try {
                // هنا يمكنك جلب مسار الطلب من الـ API
                const response = await fetch(`/api/orders/${orderId}/track`);
                const data = await response.json();
                
                if (data.route && data.route.coordinates) {
                    const validCoords = data.route.coordinates.filter(coord => 
                        isValidCoordinate(coord[1], coord[0])
                    );
                    
                    if (validCoords.length > 0 && map.current.getSource('route')) {
                        map.current.getSource('route').setData({
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'LineString',
                                coordinates: validCoords
                            }
                        });
                        
                        // ضبط الخريطة على المسار
                        const bounds = new mapboxgl.LngLatBounds();
                        validCoords.forEach(coord => bounds.extend(coord));
                        map.current.fitBounds(bounds, { padding: 50 });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch order route:', error);
            }
        };

        fetchOrderRoute();
    }, [orderId]);

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

OrderTrackingMap.displayName = 'OrderTrackingMap';

export default OrderTrackingMap;