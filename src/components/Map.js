import { GoogleMap, LoadScript, DirectionsRenderer } from '@react-google-maps/api';
import React, { useState, useCallback, useRef } from 'react';
import RecordButton from './RecordButton';
import TextBubble from './TextBubble';
import useLocation from '../hooks/useLocation';
import { mapStyles } from '../styles/mapStyles';

const center = {
  lat: 35.6812362,  // Tokyo Station coordinates
  lng: 139.7671248
};

const API_KEY = "AIzaSyAE7Pb7MSZTljD-xh8XFAd7Oumyoys4FK8";


function Map() {
const [isFirstRequest, setIsFirstRequest] = useState(true);
  const { location, handleMapLoad, lat, lng } = useLocation();
  const [conversations, setConversations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [selectedLandmarks, setSelectedLandmarks] = useState([]);



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
      <LoadScript 
        googleMapsApiKey={API_KEY}
        libraries={['places']}
      >
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
        isFirstRequest={isFirstRequest}
        lat={lat}
        lng={lng}
      />
    </div>
  );
}

export default Map; 