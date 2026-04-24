// src/utils/mapHelpers.js - نسخة محسنة بالكامل ومتوافقة مع بياناتك

/**
 * التحقق من صحة الإحداثيات
 */
export const isValidCoordinate = (lat, lng) => {
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

/**
 * استخراج إحداثيات المندوب بأمان
 * متوافق مع بنية البيانات التي أرسلتها:
 * {
 *   driverInfo: {
 *     currentLocation: {
 *       coordinates: [lng, lat]
 *     }
 *   }
 * }
 */
export const getDriverCoordinates = (driver) => {
  if (!driver) return null;
  
  console.log(`🔍 [mapHelpers] Getting coordinates for driver: ${driver.name || driver._id}`);
  
  try {
    // ✅ المحاولة 1: driver.driverInfo.currentLocation.coordinates (بناءً على بياناتك)
    if (driver.driverInfo?.currentLocation?.coordinates && Array.isArray(driver.driverInfo.currentLocation.coordinates)) {
      const coords = driver.driverInfo.currentLocation.coordinates;
      if (coords.length >= 2) {
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        if (isValidCoordinate(lat, lng)) {
          console.log(`✅ Driver ${driver.name} coordinates from driverInfo.currentLocation.coordinates: [${lat}, ${lng}]`);
          return { lat, lng };
        }
      }
    }

    // ✅ المحاولة 2: driver.location.coordinates (صيغة GeoJSON)
    if (driver.location?.coordinates && Array.isArray(driver.location.coordinates)) {
      const coords = driver.location.coordinates;
      if (coords.length >= 2) {
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        if (isValidCoordinate(lat, lng)) {
          console.log(`✅ Driver ${driver.name} coordinates from location.coordinates: [${lat}, ${lng}]`);
          return { lat, lng };
        }
      }
    }
    
    // ✅ المحاولة 3: driver.currentLocation (كائن بسيط)
    if (driver.currentLocation && typeof driver.currentLocation === 'object') {
        let lat, lng;
        if (driver.currentLocation.lat !== undefined && driver.currentLocation.lng !== undefined) {
            lat = parseFloat(driver.currentLocation.lat);
            lng = parseFloat(driver.currentLocation.lng);
        } else if (driver.currentLocation.latitude !== undefined && driver.currentLocation.longitude !== undefined) {
            lat = parseFloat(driver.currentLocation.latitude);
            lng = parseFloat(driver.currentLocation.longitude);
        }
        if (isValidCoordinate(lat, lng)) {
            console.log(`✅ Driver ${driver.name} coordinates from currentLocation object: [${lat}, ${lng}]`);
            return { lat, lng };
        }
    }
    
    // ✅ المحاولة 4: driver.latitude / driver.longitude
    if (driver.latitude !== undefined && driver.longitude !== undefined) {
      const lat = parseFloat(driver.latitude);
      const lng = parseFloat(driver.longitude);
      if (isValidCoordinate(lat, lng)) {
        console.log(`✅ Driver ${driver.name} coordinates from lat/lng fields: [${lat}, ${lng}]`);
        return { lat, lng };
      }
    }
    
    // ✅ المحاولة 5: driver.lat / driver.lng
    if (driver.lat !== undefined && driver.lng !== undefined) {
      const lat = parseFloat(driver.lat);
      const lng = parseFloat(driver.lng);
      if (isValidCoordinate(lat, lng)) {
        console.log(`✅ Driver ${driver.name} coordinates from lat/lng fields: [${lat}, ${lng}]`);
        return { lat, lng };
      }
    }
    
    console.warn(`⚠️ No valid coordinates found for driver: ${driver.name || driver._id}`);
    if (driver.driverInfo) {
      console.warn('   Driver has driverInfo:', {
        hasCurrentLocation: !!driver.driverInfo.currentLocation,
        currentLocationKeys: driver.driverInfo.currentLocation ? Object.keys(driver.driverInfo.currentLocation) : [],
        coordinates: driver.driverInfo.currentLocation?.coordinates
      });
    }
    if (driver.location) {
      console.warn('   Driver has location:', {
        hasCoordinates: !!driver.location.coordinates,
        coordinates: driver.location.coordinates
      });
    }
    return null;
  } catch (error) {
    console.error('Error getting driver coordinates:', error);
    return null;
  }
};

/**
 * استخراج إحداثيات المتجر بأمان
 */
export const getStoreCoordinates = (store) => {
  if (!store) return null;
  
  try {
    // 1. من address.latitude/longitude
    if (store.address?.latitude && store.address?.longitude) {
      const lat = parseFloat(store.address.latitude);
      const lng = parseFloat(store.address.longitude);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng };
      }
    }
    
    // 2. من location.coordinates (GeoJSON)
    if (store.location?.coordinates && Array.isArray(store.location.coordinates)) {
      const coords = store.location.coordinates;
      if (coords.length >= 2) {
        const lng = parseFloat(coords[0]);
        const lat = parseFloat(coords[1]);
        if (isValidCoordinate(lat, lng)) {
          return { lat, lng };
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting store coordinates:', error);
    return null;
  }
};

/**
 * استخراج إحداثيات الطلب
 */
export const getOrderCoordinates = (order, type = 'delivery') => {
  if (!order) return null;
  
  try {
    let address = null;
    
    if (type === 'pickup') {
      address = order.pickupAddress;
    } else {
      address = order.deliveryAddress;
    }
    
    if (!address) return null;
    
    if (address.latitude && address.longitude) {
      const lat = parseFloat(address.latitude);
      const lng = parseFloat(address.longitude);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng, address: address.addressLine };
      }
    }
    
    if (address.location?.coordinates && address.location.coordinates.length >= 2) {
      const coords = address.location.coordinates;
      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);
      if (isValidCoordinate(lat, lng)) {
        return { lat, lng, address: address.addressLine };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order coordinates:', error);
    return null;
  }
};

/**
 * حساب المسافة بين نقطتين (هافرسين)
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * تنسيق المسافة للعرض
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} م`;
  }
  return `${distanceKm.toFixed(1)} كم`;
};

/**
 * الحصول على عنوان من الإحداثيات (عكسياً)
 */
export const reverseGeocode = async (lat, lng, accessToken) => {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${accessToken}&language=ar`
    );
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};