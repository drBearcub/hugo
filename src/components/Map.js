import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import RecordButton from './RecordButton';
import TextBubble from './TextBubble';
import useLocation from '../hooks/useLocation';
import { mapStyles } from '../styles/mapStyles';

const center = {
  lat: 35.6812362,  // Tokyo Station coordinates
  lng: 139.7671248
};

const API_KEY = "AIzaSyClvLVSInVxYLmk0FCgTge9JTRHmZgEmcM";
const GOOGLE_SEARCH_API_KEY = "AIzaSyClvLVSInVxYLmk0FCgTge9JTRHmZgEmcM";
const GOOGLE_SEARCH_ENGINE_ID = "b5db152f470904804";

const testImageSearch = async () => {
  try {
    const query = "tokyo imperial palace";
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_SEARCH_API_KEY}&cx=${GOOGLE_SEARCH_ENGINE_ID}&q=${query}&searchType=image&num=1`
    );
    
    if (!response.ok) {
      throw new Error('Image search failed');
    }
    
    const data = await response.json();
    const imageUrl = data.items[0].link;
    console.log("Found image URL:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("Error searching for image:", error);
    return null;
  }
};

function Map() {
  const [isFirstRequest, setIsFirstRequest] = useState(true);
  const { location, handleMapLoad, lat, lng } = useLocation();
  const [conversations, setConversations] = useState([]);
  const [directions, setDirections] = useState(null);
  const [selectedLandmarks, setSelectedLandmarks] = useState([]);
  const [testImage, setTestImage] = useState(null);
  const [isExploreMode, setIsExploreMode] = useState(false);

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

  useEffect(() => {
    testImageSearch().then(url => setTestImage(url));
  }, []);

  console.log({conversations})

  return (
    <div style={{ height: '100vh', width: '100vw', position: 'relative' }}>
      {testImage && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000 }}>
          <img src={testImage} alt="Test landmark" style={{ width: 100, height: 100, objectFit: 'cover' }} />
        </div>
      )}
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
          {/* Add custom markers */}
          {selectedLandmarks.map((landmark, index) => (
            <Marker
              key={index}
              position={landmark.location}
              icon={{
                url: landmark.photoUrl || 'https://via.placeholder.com/40', // Use fetched URL or fallback
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 20),
                borderRadius: '50%'
              }}
            />
          ))}

          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false, // Hide default A,B,C markers
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
      />

      
    </div>
  );
}

export default Map; 