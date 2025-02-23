import { GoogleMap, LoadScript, DirectionsRenderer, Marker, InfoWindow, Circle } from '@react-google-maps/api';
import React, { useState, useCallback, useEffect, use } from 'react';
import RecordButton from './RecordButton';
import TextBubble from './TextBubble';
import useLocation from '../hooks/useLocation';
import { mapStyles } from '../styles/mapStyles';
import { API_KEYS } from '../config/api-keys';

const center = {
  lat: 35.6812362,
  lng: 139.7671248
};

// Add new styles at the top
const landmarkInfoStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  borderRadius: '15px',
  padding: '15px',
  display: 'flex',
  gap: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 1000,
  maxWidth: '90%',
  width: '400px'
};

const landmarkImageStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #FF69B4'
};

const landmarkTextStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center'
};

// Add to styles at the top
const buttonStyle = {
  border: 'none',
  padding: '8px 16px',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '5px'
};

const removeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#FFE4E9',
  color: '#FF69B4',
  marginTop: '10px'
};

function Map() {
  const [isFirstRequest, setIsFirstRequest] = useState(true);
  const { location, handleMapLoad: handleLocationMapLoad, lat, lng } = useLocation();
  const [conversations, setConversations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [selectedLandmarks, setSelectedLandmarks] = useState([]);
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [mapZoom, setMapZoom] = useState(16);
  const [mapRef, setMapRef] = useState(null);

  useEffect(() => {
    console.log({selectedLandmarks})
    requestDirections(selectedLandmarks);
  }, [selectedLandmarks])

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

    if (response.parsedLandmarks && response.parsedLandmarks.length > 0 && !isExploreMode) {
      setSelectedLandmarks(response.parsedLandmarks);
      requestDirections(response.parsedLandmarks);
      setIsExploreMode(true);
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
        //optimizeWaypoints: true  [david] here is how we optimize the way points
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

  const handleMarkerClick = async (landmark) => {
    setSelectedMarker(landmark);

    const prompt = `Tell me about ${landmark.name} in four or 5 sentences.`;

    const payload = {
      city: {name: location, latitude: lat, longitude: lng},
      is_first_request: false
    };

    try {
      const response = await fetch(`https://voice-view-backend-ef6f06a14ec9.herokuapp.com/answer?query=${prompt}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      console.log(apiResponse);
      
      // Call ElevenLabs API for text-to-speech
      const voiceId = "TM06xeVjGogwgQkF4GaW"; // Default voice ID

      const response_audio = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY
        },
        body: JSON.stringify({
          text: apiResponse.speech,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            speed:1.00
          }
        })
      });

      if (response_audio.ok) {
        const audioBlob = await response_audio.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }

      // Update the UI with the description
      // TODO: Add description to the landmark info display

    } catch (error) {
      console.error('Error fetching landmark description:', error);
    }
  };

  const removeLandmark = (landmarkToRemove) => {
    setSelectedLandmarks(prev => prev.filter(landmark => landmark.name !== landmarkToRemove.name));
    setSelectedMarker(null);
  };

  // Calculate circle radius based on zoom level
  const getCircleRadius = (zoom) => {
    return 25 * Math.pow(2, (16 - zoom)); // Base radius is 25 at zoom level 16
  };

  const handleGoogleMapLoad = useCallback((map) => {
    setMapRef(map);
    handleLocationMapLoad(map);
  }, [handleLocationMapLoad]);

  // Handle zoom changes
  useEffect(() => {
    if (mapRef) {
      const listener = mapRef.addListener('zoom_changed', () => {
        setMapZoom(mapRef.getZoom());
      });
      return () => {
        window.google.maps.event.removeListener(listener);
      };
    }
  }, [mapRef]);

  console.log({selectedLandmarks})
  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {/* Add landmark info display */}
      {selectedMarker && (
        <div style={landmarkInfoStyle}>
          <img 
            src={selectedMarker.photoUrl} 
            alt={selectedMarker.name}
            style={landmarkImageStyle}
          />
          <div style={landmarkTextStyle}>
            <h3 style={{ 
              margin: '0 0 8px 0',
              color: '#333',
              fontSize: '20px'
            }}>
              {selectedMarker.name}
            </h3>
            <button 
              onClick={() => removeLandmark(selectedMarker)}
              style={removeButtonStyle}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF69B4">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Remove from route
            </button>
            <button 
              onClick={() => setSelectedMarker(null)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                border: 'none',
                background: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}

      <LoadScript 
        googleMapsApiKey={API_KEYS.GOOGLE_MAPS}
        libraries={['places']}
      >
        <GoogleMap
          mapContainerStyle={{
            height: '100vh',
            width: '100vw'
          }}
          center={selectedLandmarks[0]?.location || center}
          zoom={16}
          onLoad={handleGoogleMapLoad}
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
          {/* Add custom markers */}
          {selectedLandmarks.map((landmark, index) => (
            <>
              {/* Add circle for selected marker */}
              {selectedMarker?.name === landmark.name && (
                <Circle
                  center={landmark.location}
                  options={{
                    strokeColor: '#FF69B4',
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    fillColor: 'transparent',
                    fillOpacity: 0,
                    radius: getCircleRadius(mapZoom),
                    zIndex: 1
                  }}
                />
              )}
              <Marker
                key={index}
                position={landmark.location}
                onClick={() => handleMarkerClick(landmark)}
                icon={{
                  url: landmark.photoUrl || 'https://via.placeholder.com/40',
                  scaledSize: new window.google.maps.Size(40, 40),
                  anchor: new window.google.maps.Point(20, 20),
                  borderRadius: '50%'
                }}
              />
            </>
          ))}

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true, // Hide default A,B,C markers
                polylineOptions: {
                  strokeColor: '#FF69B4',
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
        isFirstRequest={isFirstRequest}
        lat={lat}
        lng={lng}
        selectedLandmarks={selectedLandmarks}
        isExploreMode={isExploreMode}
      />
    </div>
  );
}

export default Map; 