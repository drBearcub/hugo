export const recordButtonStyle = {
  position: 'absolute',
  bottom: '100px',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  border: 'none',
  backgroundColor: 'rgba(32, 33, 36, 0.9)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
  zIndex: 1000
};

export const micIconStyle = {
  width: '24px',
  height: '24px',
  fill: '#ffffff'
};

export const waveContainerStyle = {
  position: 'absolute',
  bottom: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '3px',
  height: '30px',
  alignItems: 'center',
  zIndex: 1000
};

export const waveBarStyle = {
  width: '3px',
  backgroundColor: 'white',
  borderRadius: '3px',
  animation: 'soundWave 1s ease-in-out infinite',
  boxShadow: '0 0 5px rgba(0,0,0,0.2)',
  zIndex: 1000
};

export const processingContainerStyle = {
  position: 'absolute',
  bottom: '80px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000
};

export const statusTextStyle = {
  position: 'absolute',
  bottom: '75px',
  left: '50%',
  transform: 'translateX(-50%)',
  color: 'white',
  backgroundColor: 'rgba(0,0,0,0.7)',
  padding: '5px 10px',
  borderRadius: '15px',
  fontSize: '14px',
  zIndex: 1000
};

export const waveAnimation = `
  @keyframes soundWave {
    0% { height: 3px; }
    50% { height: 20px; }
    100% { height: 3px; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`; 