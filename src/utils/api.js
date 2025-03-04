/**
 * Makes a request to the Voice View backend API
 * @param {string} query - The query or prompt to send
 * @param {string} name - address of the current map location
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {boolean} isFirstRequest - Whether this is the first request in the session
 * @returns {Promise<Object>} - Promise resolving to the API response
 */
export const fetchGuideResponse = async (query, locationName, latitude, longitude, isFirstRequest = false) => {
  const payload = {
    city: {
      name: locationName, 
      latitude, 
      longitude
    },
    is_first_request: isFirstRequest
  };
  
  try {
    const response = await fetch(`https://voice-view-backend-ef6f06a14ec9.herokuapp.com/answer?query=${encodeURIComponent(query)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from backend:', error);
    throw error;
  }
}; 