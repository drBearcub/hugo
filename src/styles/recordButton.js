export const recordButtonStyle = {
  position: 'absolute',
  bottom: '100px',
  left: 0,
  right: 0,
  margin: '0 auto',
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
  bottom: '180px',
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: '2px',
  height: '40px',
  width: '200px',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
};

export const waveBarStyle = {
  width: '4px',
  backgroundColor: '#FF69B4',
  borderRadius: '2px',
  animation: 'soundWave 1.2s ease-in-out infinite',
  boxShadow: '0 0 5px rgba(0,0,0,0.2)',
  zIndex: 1000
};

export const processingContainerStyle = {
  position: 'absolute',
  bottom: '180px',
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 1000
};

export const statusTextStyle = {
  position: 'absolute',
  bottom: '50px',
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
    0% { height: 4px; opacity: 0.3; }
    50% { height: 25px; opacity: 1; }
    100% { height: 4px; opacity: 0.3; }
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
  color: '#fff',
  fontSize: '18px'
};

export const overlayTextStyle = {
  color: '#EA4335',
  marginTop: '20px',
  fontWeight: '500'
};

export const transcriptionBubbleStyle = {
  position: 'absolute',
  bottom: '200px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '15px 25px',
  borderRadius: '25px',
  maxWidth: '80%',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 1000,
  fontSize: '16px',
  color: '#000',
  textAlign: 'center'
};

export const thinkingBubbleStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  borderRadius: '30px',
  padding: '10px 10px',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 1000,
  maxWidth: '90%'
};

export const guideAvatarStyle = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#FF69B4',
  color: 'white'
}; 