import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import React, { useState, useCallback, useRef } from 'react';
import RecordButton from './RecordButton';
import TextBubble from './TextBubble';

const center = {
  lat: 35.6812362,  // Tokyo Station coordinates
  lng: 139.7671248
};

const API_KEY = "AIzaSyAE7Pb7MSZTljD-xh8XFAd7Oumyoys4FK8";

// Locations
const TOKYO_STATION = { lat: 35.6812362, lng: 139.7671248 };
const HOSHINOYA = { lat: 35.6853755, lng: 139.7670297 };

const mapStyles = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e6e6e6" }]
  },
  {
    featureType: "road.arterial",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c8d7d4" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#d5e7d6" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.text",
    stylers: [{ visibility: "simplified" }]
  }
];

// Custom hook for handling location
const useLocation = () => {
  const [location, setLocation] = useState('Loading location...');
  const mapRef = useRef(null); // Add this line to create the ref
  
  const handleMapLoad = useCallback((map) => {
    console.log("handleMapLoad", "before")
    // Early return if map is null or if we've already set up listeners
    if (!map || mapRef.current === map) return;
    console.log("handleMapLoad", "did not return early")
    mapRef.current = map; // Store the map instance in the ref

    const geocoder = new window.google.maps.Geocoder();

    const updateLocation = () => {
      const center = map.getCenter();
      geocoder.geocode({ location: { lat: center.lat(), lng: center.lng() } })
        .then((response) => {
          if (response.results[0]) {
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

  return { location, handleMapLoad };
};

function Map() {
  const [isFirstRequest, setIsFirstRequest] = useState(true);
  const { location, handleMapLoad } = useLocation();
  const [conversations, setConversations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [selectedLandmarks, setSelectedLandmarks] = useState([]);

  const landmarks = [
    {
      name: "Tokyo Station",
      latitude: TOKYO_STATION.lat,
      longitude: TOKYO_STATION.lng
    },
    {
      name: "Hoshinoya Tokyo",
      latitude: HOSHINOYA.lat,
      longitude: HOSHINOYA.lng
    }
  ];

  const handleTranscriptionComplete = (text) => {
    console.log('Previous conversations:', conversations); // Debug log
    setConversations(prev => {
      console.log('Adding new conversation to:', prev); // Debug log
      return [...prev, { text, apiResponse: null }];
    });
  };

  const handleRequestComplete = (response) => {
    setIsFirstRequest(false);
    console.log('Updating conversation with response:', response); // Debug log
    setConversations(prev => {
      console.log('Current conversations before update:', prev); // Debug log
      if (prev.length === 0) {
        console.warn('No conversations to update');
        return prev;
      }
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        apiResponse: response
      };
      return updated;
    });

    if (response.parsedLandmarks && response.parsedLandmarks.length > 0) {
      setSelectedLandmarks(response.parsedLandmarks);
      requestDirections(response.parsedLandmarks);
    }
  };

  const requestDirections = useCallback((landmarks) => {
    if (!landmarks || landmarks.length < 2) return;

    const directionsService = new window.google.maps.DirectionsService();

    const origin = landmarks[0].location;
    const destination = landmarks[landmarks.length - 1].location;
    const waypoints = landmarks.slice(1, -1).map(landmark => ({
      location: landmark.location,
      stopover: true
    }));

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        travelMode: window.google.maps.TravelMode.WALKING,
        optimizeWaypoints: true
      },
      (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('Directions request failed:', status);
        }
      }
    );
  }, []);

  const handleCloseBubble = (index) => {
    setConversations(prev => prev.filter((_, i) => i !== index));
  };

  console.log({conversations})

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      <LoadScript googleMapsApiKey={API_KEY}>
        <GoogleMap
          mapContainerStyle={{
            height: '100vh',
            width: '100vw'
          }}
          center={selectedLandmarks[0]?.location || center}
          zoom={16}
          onLoad={handleMapLoad}
          options={{
            styles: mapStyles,
            disableDefaultUI: false,
            clickableIcons: false,
            zoomControl: true,
            zoomControlOptions: {
              position: 7
            },
            gestureHandling: 'cooperative',
            mapTypeControl: false,
            scaleControl: true,
            streetViewControl: false,
            rotateControl: false,
            fullscreenControl: false,
            minZoom: 3,
            maxZoom: 20
          }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#2196F3',
                  strokeWeight: 4
                }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Container for text bubbles that starts from top */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '0',
        right: '0',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '0 20px',
        maxHeight: '60vh',  // Limit height to prevent overlapping with record button
        overflowY: 'auto',  // Allow scrolling if many bubbles
        zIndex: 1000
      }}>
        {conversations.map((conv, index) => (
          <TextBubble 
            key={index}
            text={conv.text}
            apiResponse={conv.apiResponse}
            onClose={() => handleCloseBubble(index)}
          />
        ))}
      </div>
      
      <RecordButton 
        onTranscriptionComplete={handleTranscriptionComplete}
        onRequestComplete={handleRequestComplete}
        location={location}
        landmarks={landmarks}
        isFirstRequest={isFirstRequest}
      />
    </div>
  );
}

export default Map; 