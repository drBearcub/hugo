import React from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import OpenAI from 'openai';
import {
  recordButtonStyle,
  waveContainerStyle,
  waveBarStyle,
  waveAnimation,
  statusTextStyle,
  micIconStyle,
  overlayStyle,
  transcriptionBubbleStyle,
  thinkingBubbleStyle,
} from '../styles/recordButton';
import { API_KEYS } from '../config/api-keys';
import guideAvatar from '../pangpang.png';
import { textToSpeech } from '../utils/elevenlabs';
import { fetchGuideResponse } from '../utils/api';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function RecordButton({ onRequestComplete, location, lat, lng, selectedLandmarks, isFirstRequest, isExploreMode }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [transcribedText, setTranscribedText] = React.useState('');
  const [response, setResponse] = React.useState(null);

  const [waveStyles] = React.useState(() => 
    Array(8).fill(null).map((_, i) => ({
      ...waveBarStyle,
      animationDelay: `${i * 0.1}s`
    }))
  );

  const {
    status: recordingStatus,
    startRecording,
    stopRecording,
    mediaBlobUrl: recorderMediaBlobUrl
  } = useReactMediaRecorder({ audio: true });

  React.useEffect(() => {
    // Add the animation styles to the document
    const styleSheet = document.createElement('style');
    styleSheet.textContent = waveAnimation;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const transcribeAudio = async (audioUrl) => {
    setIsTranscribing(true);
    setStatus('Transcribing audio...');
    
    try {
      const audioBlob = await fetch(audioUrl).then(r => r.blob());
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      return transcription.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw error;
    } finally {
      setIsTranscribing(false);
    }
  };

  const searchImageUrlForLandmark = async (query) => {
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${API_KEYS.GOOGLE}&cx=${API_KEYS.GOOGLE_SEARCH_ENGINE_ID}&q=${query}&searchType=image&num=1`
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

  
  const planTourWithGuide = async (transcribedText) => {
    setIsSending(true);
    setStatus('Sending to backend...');
    
    try {
      const apiResponse = await fetchGuideResponse(transcribedText, location, lat, lng, isFirstRequest);
      
      // When guide has determined it has collected enough information, it would return a list of landmarks
      // to visit. We then fetch the image urls for each landmark and return a list of landmarks with images.
      const landmarksWithImages = await Promise.all(
        apiResponse.locations.map(async (landmark) => {
          const photoUrl = await searchImageUrlForLandmark(landmark.displayName);
          return {
            name: landmark.displayName,
            location: { lat: landmark.latitude, lng: landmark.longitude },
            photoUrl: photoUrl,
            rating: landmark.rating
          };
        })
      );

      // Then create the data object with resolved image URLs
      const data = {
        response: JSON.stringify({
          explanation: apiResponse.speech,
          landmarks: apiResponse.locations
        }),
        parsedLandmarks: landmarksWithImages
      };

      setResponse(apiResponse.speech);
      textToSpeech(apiResponse.speech);
      onRequestComplete(data);
      return data;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    } finally {
      setIsSending(false);
      setStatus('');
    }
  };

  const handleNewRecording = async () => {
    // Step 1: Transcribe Audio
    try {
      const text = await transcribeAudio(recorderMediaBlobUrl);
      setTranscribedText(text); // Store transcribed text

      // Step 2: Send to Backend
      await planTourWithGuide(text);
    } catch (error) {
      console.error('Error:', error);
      setStatus('Error: ' + error);
    }
  };

  const handleRecordStart = () => {
    setIsRecording(true);
    setStatus('Recording...');
    startRecording();
    setTranscribedText('');
  };

  const handleRecordStop = () => {
    setIsRecording(false);
    stopRecording();
  };

  React.useEffect(() => {
    if (recorderMediaBlobUrl && !isRecording) {
      handleNewRecording();
    }
  }, [recorderMediaBlobUrl]);

  const shouldUseOverlay = isRecording || isTranscribing || isSending || (selectedLandmarks.length === 0 && !isFirstRequest && !isExploreMode)
  const thinking = isTranscribing || isSending
  const canDisplayResponse = response && !isSending && !isTranscribing && !isRecording && shouldUseOverlay
  const shouldDisplayAskMeAnything = !isExploreMode && !shouldUseOverlay

  const guideDialogBubble = (text) => (
    <div style={thinkingBubbleStyle}>
    <img 
      src={guideAvatar}
      alt="Guide avatar"
      style={{
        width: '60px',
        height: '60px',
        objectFit: 'contain'
      }}
    />
    <span style={{
      fontSize: '13px',
      color: '#333',
      lineHeight: '1.3'
    }}>
      {text}
    </span>
  </div>
  )
  
  return (
    <>
      {shouldDisplayAskMeAnything && guideDialogBubble(`Ask me anything about ${location}`)}
      {thinking && guideDialogBubble("Guide is thinking...")}
      {isRecording && guideDialogBubble("Guide is listening...")}
      {canDisplayResponse && guideDialogBubble(response)}

      {shouldUseOverlay && (
        <div style={overlayStyle}>
        </div>
      )}

      {/* Show transcription bubble when text exists */}
      {shouldUseOverlay && transcribedText && (
        <div style={transcriptionBubbleStyle}>
          {transcribedText}
        </div>
      )}

      {isRecording && (
        <div style={waveContainerStyle}>
          {waveStyles.map((style, index) => (
            <div key={index} style={style} />
          ))}
        </div>
      )}

      {status && (
        <div style={statusTextStyle}>
          {status}
        </div>
      )}

      <button 
        onMouseDown={handleRecordStart}
        onMouseUp={handleRecordStop}
        onTouchStart={(e) => {
          e.preventDefault(); // Prevent default touch behavior
          handleRecordStart();
        }}
        onTouchEnd={handleRecordStop}
        onContextMenu={(e) => e.preventDefault()} // Prevent context menu
        style={{
          ...recordButtonStyle,
          backgroundColor: isRecording ? '#FF69B4' : 'rgba(32, 33, 36, 0.9)',
          zIndex: 1000,
          WebkitTouchCallout: 'none', // Prevent iOS callout
          WebkitUserSelect: 'none', // Prevent text selection
          userSelect: 'none', // Prevent text selection
        }}
      >
        <svg 
          viewBox="0 0 24 24" 
          style={micIconStyle}
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/>
        </svg>
      </button>
    </>
  );
}

export default RecordButton; 