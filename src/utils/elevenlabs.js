/**
 * Converts text to speech using ElevenLabs API and plays the audio
 * @param {string} text - The text to convert to speech
 * @returns {Promise<string>} - Promise resolving to the audio URL
 */
export const textToSpeech = async (text) => {
  try {
    const voiceId = process.env.REACT_APP_ELEVENLABS_VOICE_ID;

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.REACT_APP_ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          speed: 1.00
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API call failed: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    
    // Play the audio
    const audio = new Audio(audioUrl);
    audio.play();
    
    return audioUrl;
  } catch (error) {
    console.error('Text-to-speech error:', error);
    // [David] swallowed error, app should not crash when running out of 11labs credits
  }
}; 