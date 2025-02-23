import React from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import OpenAI from 'openai';
import {
  recordButtonStyle,
  waveContainerStyle,
  waveBarStyle,
  waveAnimation,
  processingContainerStyle,
  statusTextStyle,
  micIconStyle,
  overlayStyle,
  transcriptionBubbleStyle,
  thinkingBubbleStyle,
  guideAvatarStyle
} from '../styles/recordButton';

const OPENAI_API_KEY = "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function RecordButton({ onTranscriptionComplete, onRequestComplete, location, lat, lng, selectedLandmarks, isFirstRequest }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [status, setStatus] = React.useState('');
  const [transcribedText, setTranscribedText] = React.useState('');

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

  const sendToBackend = async (transcribedText) => {
    setIsSending(true);
    setStatus('Sending to backend...');
    
    try {
      const payload = {
        city: {name: location, latitude: lat, longitude: lng},
        
        //text: transcribedText,
        is_first_request: isFirstRequest
      };

   
      //const response = await fetch(`http://192.168.1.111:8000/answer?query=${transcribedText}`, {

      const response = await fetch(`https://voice-view-backend-ef6f06a14ec9.herokuapp.com/answer?query=${transcribedText}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.log(response);
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const apiResponse = await response.json();

      console.log(apiResponse);
      
      // Transform the API response to match expected format
      const data = {
        response: JSON.stringify({
          explanation: apiResponse.speech,
          landmarks: apiResponse.locations
        }),
        parsedLandmarks: apiResponse.locations.map(landmark => ({
          name: landmark.displayNames,
          location: { lat: landmark.latitude, lng: landmark.longitude }
        }))
      };
     
      /*
      const response = {
        "locations": [{"name":"Statue of Liberty","latitude":40.6892,"longitude":-74.0445},{"name":"Times Square","latitude":40.758,"longitude":-73.9855},{"name":"Central Park","latitude":40.7851,"longitude":-73.9683}],
        "speech": "Hello! How can I assist you today in exploring Tokyo? Are there any specific places you're interested in, like historical sites, shopping districts, or perhaps a nice walk through a park?"
      } */

      // Call ElevenLabs API for text-to-speech
      const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Default voice ID

      console.log(data.response.speech);
      const response_audio = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': 'sk_cd394cf351cdaf1f0fe0330ff5bcba40cdfc01d1af7efb1e'
        },
        body: JSON.stringify({
          text: apiResponse.speech,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            speed:1.20
          }
        })
      });

      if (response_audio.ok) {
        const audioBlob = await response_audio.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
      }

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

  const handleProcessing = async () => {
    // Step 1: Transcribe Audio
    try {
      const text = await transcribeAudio(recorderMediaBlobUrl);
      console.log('Transcription completed:', text);
      setTranscribedText(text); // Store transcribed text
      onTranscriptionComplete(text);

      // Step 2: Send to Backend
      const response = await sendToBackend(text);
      console.log('Backend response received:', response);
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
      handleProcessing();
    }
  }, [recorderMediaBlobUrl]);

  const shouldUseOverlay = isRecording || isTranscribing || isSending || (selectedLandmarks.length === 0 && !isFirstRequest)
  const thinking = isTranscribing || isSending
  
  return (
    <>
      {thinking && (
        <div style={thinkingBubbleStyle}>
          <div style={guideAvatarStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <span>Guide is thinking...</span>
        </div>
      )}

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

      {(isTranscribing || isSending) && (
        <div style={processingContainerStyle}>
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke={isTranscribing ? "#2196F3" : "#FF69B4"}
              strokeWidth="3"
              fill="none"
              style={{
                animation: "spin 1s linear infinite",
              }}
            />
          </svg>
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
        style={{
          ...recordButtonStyle,
          backgroundColor: isRecording ? '#FF69B4' : 'rgba(32, 33, 36, 0.9)',
          zIndex: 1000
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