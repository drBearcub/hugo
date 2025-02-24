import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import React, { useState, useCallback, useEffect } from 'react';
import RecordButton from './RecordButton';
import useLocation from '../hooks/useLocation';
import { mapStyles } from '../styles/mapStyles';
import { API_KEYS } from '../config/api-keys';
import {
  landmarkInfoStyle,
  landmarkImageStyle,
  landmarkTextStyle,
  removeButtonStyle,
  ratingStyle,
  descriptionStyle,
  landmarkTitleStyle,
  mapContainerStyle
} from '../styles/mapStyles';

const center = {
  lat: 37.7749,
  lng: -122.4194
};

function Map() {
  const [isFirstRequest, setIsFirstRequest] = useState(true);
  const { location, handleMapLoad: handleLocationMapLoad, lat, lng } = useLocation();
  const [conversations, setConversations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [selectedLandmarks, setSelectedLandmarks] = useState([]);
  const [isExploreMode, setIsExploreMode] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [tellMeAboutLandmark, setTellMeAboutLandmark] = useState(null);

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

    console.log("before setting state, ", {response})

    if (response.parsedLandmarks && response.parsedLandmarks.length > 0 && !isExploreMode) {
      console.log("should set state, ", {response})

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
      setTellMeAboutLandmark(apiResponse.speech);
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
          //[david] set with this guy
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
    } catch (error) {
      console.error('Error fetching landmark description:', error);
    }
  };

  const removeLandmark = (landmarkToRemove) => {
    setSelectedLandmarks(prev => prev.filter(landmark => landmark.name !== landmarkToRemove.name));
    setSelectedMarker(null);
  };

  const handleGoogleMapLoad = useCallback((map) => {
    handleLocationMapLoad(map);
  }, [handleLocationMapLoad]);

  console.log({selectedMarker})
  console.log({selectedLandmarks})
  return (
    <div style={mapContainerStyle}>
      {selectedMarker && (
        <div style={landmarkInfoStyle}>
          <img 
            src={selectedMarker.photoUrl} 
            alt={selectedMarker.name}
            style={landmarkImageStyle}
          />
          <div style={landmarkTextStyle}>
            <div style={{ flex: 1 }}>
              <h4 style={landmarkTitleStyle}>
                {selectedMarker.name}
              </h4>
              <div style={ratingStyle}>
                {/* Star rating */}
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: i < (selectedMarker.rating || 0) ? '#FFD700' : '#E0E0E0' }}>
                    ★
                  </span>
                ))}
                {selectedMarker.rating && 
                  <span style={{ marginLeft: '4px' }}>{selectedMarker.rating.toFixed(1)}</span>
                }
              </div>
              <p style={descriptionStyle}>
                {tellMeAboutLandmark || 'Loading description...'}
              </p>
            </div>
            <button 
              onClick={() => removeLandmark(selectedMarker)}
              style={{
                ...removeButtonStyle,
                marginTop: 0,
                flexShrink: 0,
                alignSelf: 'flex-start' // Align button to top when description is present
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#FF69B4">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              Remove
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
            disableDefaultUI: true,
            clickableIcons: false,
            zoomControl: false,
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