import { useState, useCallback, useRef } from 'react';

/**
 * Custom hook for handling map location updates
 */
const useLocation = () => {
  const [location, setLocation] = useState('Loading location...');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const mapRef = useRef(null);

  const handleMapLoad = useCallback((map) => {
    if (!map || mapRef.current === map) return;
    mapRef.current = map;

    const geocoder = new window.google.maps.Geocoder();

    const updateLocation = () => {
      const center = map.getCenter();
      geocoder.geocode({ location: { lat: center.lat(), lng: center.lng() } })
        .then((response) => {
          if (response.results[0]) {
            console.log(center.lat(), center.lng());
            setLat(center.lat());
            setLng(center.lng());
            setLocation(response.results[0].formatted_address);
        
          } else {
            setLocation('Location not found');
          }
        })
        .catch((error) => {
          console.error('Geocoder failed:', error);
          setLocation('Error getting location');
        });
    };

    updateLocation();
    map.addListener('idle', updateLocation);
  }, []);

  return { location, handleMapLoad, lat, lng};
};

export default useLocation; 