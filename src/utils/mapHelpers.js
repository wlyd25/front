// utils/mapHelpers.js
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

export const getSafeCoordinates = (data, type = 'store') => {
    try {
        if (type === 'store') {
            if (data.address?.latitude && data.address?.longitude) {
                return {
                    lat: parseFloat(data.address.latitude),
                    lng: parseFloat(data.address.longitude),
                };
            }
            if (data.location?.coordinates && Array.isArray(data.location.coordinates)) {
                const coords = data.location.coordinates;
                if (coords.length >= 2 && isValidCoordinate(coords[1], coords[0])) {
                    return {
                        lat: parseFloat(coords[1]),
                        lng: parseFloat(coords[0]),
                    };
                }
            }
        }
        
        if (type === 'driver') {
            if (data.location?.coordinates && Array.isArray(data.location.coordinates)) {
                const coords = data.location.coordinates;
                if (coords.length >= 2 && isValidCoordinate(coords[1], coords[0])) {
                    return {
                        lat: parseFloat(coords[1]),
                        lng: parseFloat(coords[0]),
                    };
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error getting coordinates:', error);
        return null;
    }
};