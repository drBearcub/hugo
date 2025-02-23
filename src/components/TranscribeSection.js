import React, { useState } from 'react';
import OpenAI from 'openai';
import {
  transcribeButtonStyle,
} from '../styles/map';

const OPENAI_API_KEY = "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";

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Custom hook for handling transcription
const useTranscription = (audioBlobUrl, onTranscriptionComplete) => {
  const [transcribedText, setTranscribedText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleTranscribe = async () => {
    if (!audioBlobUrl) return;

    setIsTranscribing(true);
    try {
      const audioBlob = await fetch(audioBlobUrl).then(r => r.blob());
      const audioFile = new File([audioBlob], 'audio.mp3', { type: 'audio/mp3' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
      });

      setTranscribedText(transcription.text);
      onTranscriptionComplete(transcription.text);
      return transcription.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setTranscribedText('Error transcribing audio: ' + error.message);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  };

  return { transcribedText, isTranscribing, handleTranscribe };
};

// Custom hook for handling API requests
const useApiRequest = (transcribedText, location, landmarks, isFirstRequest, onRequestComplete) => {
  const [isSending, setIsSending] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  const sendToBackend = async () => {
    if (!transcribedText) return;

    setIsSending(true);
    try {
      const payload = {
        city: location,
        landmarks,
        text: transcribedText,
        is_first_request: isFirstRequest
      };

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
      setApiResponse(data);
      onRequestComplete(data);
      return data;
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setApiResponse({ error: error.message });
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return { apiResponse, isSending, sendToBackend };
};

function TranscribeSection({ 
  audioBlobUrl, 
  location,
  landmarks,
  isFirstRequest,
  onTranscriptionComplete,
  onRequestComplete 
}) {
  const { transcribedText, isTranscribing, handleTranscribe } = useTranscription(audioBlobUrl, onTranscriptionComplete);
  const { apiResponse, isSending, sendToBackend } = useApiRequest(
    transcribedText,
    location,
    landmarks,
    isFirstRequest,
    onRequestComplete
  );

  React.useEffect(() => {
    if (transcribedText && !isTranscribing) {
      sendToBackend();
    }
  }, [transcribedText, isTranscribing]);

  return (
    <div>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <button 
          onClick={handleTranscribe}
          disabled={!audioBlobUrl || isTranscribing}
          style={transcribeButtonStyle}
        >
          Transcribe
        </button>
      </div>
      
      <div style={{ marginTop: '10px' }}>
        <strong>Status:</strong>
        {isTranscribing && <span> (Transcribing...)</span>}
        {isSending && <span> (Sending to backend...)</span>}
      </div>
      
      {audioBlobUrl && (
        <div style={{ marginTop: '10px' }}>
          <audio src={audioBlobUrl} controls />
        </div>
      )}
    </div>
  );
}

export default TranscribeSection; 