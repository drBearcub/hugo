import React from 'react';
import { useReactMediaRecorder } from 'react-media-recorder';
import OpenAI from 'openai';
import {
  recordButtonStyle,
  waveContainerStyle,
  waveBarStyle,
  waveAnimation,
  processingContainerStyle,
  statusTextStyle
} from '../styles/recordButton';

const OPENAI_API_KEY = "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

function RecordButton({ onTranscriptionComplete, onRequestComplete, location, landmarks, isFirstRequest }) {
  const [isRecording, setIsRecording] = React.useState(false);
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [status, setStatus] = React.useState('');
  
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
        city: location,
        landmarks,
        text: transcribedText,
        is_first_request: isFirstRequest
      };

      /* [David] uncommont this when backend server works 

      const response = await fetch('https://voice-view-backend-ef6f06a14ec9.herokuapp.com/process_city_landmarks_text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`);
      }

      const data = await response.json();
      */
      const mockResponse = {
        response: '{"explanation": "Here is the best route for touring New York! Start at the iconic Statue of Liberty, then head to the bustling Times Square, and finish your tour at the peaceful Central Park.", "landmarks":[{"name":"Statue of Liberty","latitude":40.6892,"longitude":-74.0445},{"name":"Times Square","latitude":40.758,"longitude":-73.9855},{"name":"Central Park","latitude":40.7851,"longitude":-73.9683}]}'
      };
      
      // Parse the response string into an object
      const parsedResponse = JSON.parse(mockResponse.response);
      const data = {
        ...mockResponse,
        parsedLandmarks: parsedResponse.landmarks.map(landmark => ({
          name: landmark.name,
          location: { lat: landmark.latitude, lng: landmark.longitude }
        })),
        explanation: parsedResponse.explanation
      };
      
      onRequestComplete(data);
      return data;
    } catch (error) {
      console.error('Error sending to backend:', error);
      throw error;
    } finally {
      setIsSending(false);
      setStatus('');
    }
  };

  const handleProcessing = async () => {
    // Step 1: Transcribe Audio
    let transcribedText;
    try {
      transcribedText = await transcribeAudio(recorderMediaBlobUrl);
      console.log('Transcription completed:', transcribedText);
      onTranscriptionComplete(transcribedText);
    } catch (error) {
      console.error('Transcription error:', error);
      setStatus('Error transcribing audio: ' + error);
      return;
    }

    // Step 2: Send to Backend
    try {
      const response = await sendToBackend(transcribedText);
      console.log('Backend response received:', response);
    } catch (error) {
      console.error('Backend error:', error);
      setStatus('Error sending to backend: ' + error);
    }
  };

  const handleRecordStart = () => {
    setIsRecording(true);
    setStatus('Recording...');
    startRecording();
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

  return (
    <>
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
              stroke={isTranscribing ? "#2196F3" : "#9c27b0"}
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
          backgroundColor: isRecording ? '#ff4444' : 
                         isTranscribing ? '#2196F3' :
                         isSending ? '#9c27b0' : '#4CAF50',
        }}
      >
        {isRecording ? 'Recording...' : 
         isTranscribing ? 'Transcribing...' :
         isSending ? 'Sending...' : 'Press and Hold to Record'}
      </button>
    </>
  );
}

export default RecordButton; 