export const containerStyle = {
  width: '100%',
  height: '400px',
  position: 'relative'
};

export const controlsContainerStyle = {
  marginTop: '20px',
  padding: '20px',
  backgroundColor: '#f5f5f5',
  borderRadius: '8px'
};

export const buttonStyle = {
  padding: '8px 16px',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer'
};

export const transcribeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#2196F3'
};

export const sendButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#9c27b0'
};

export const responseContainerStyle = {
  backgroundColor: 'white',
  padding: '10px',
  borderRadius: '4px',
  overflow: 'auto'
};

export const textBubbleContainerStyle = {
  position: 'absolute',
  top: '20px',
  left: '0',
  right: '0',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  padding: '0 20px',
  maxHeight: '60vh',
  overflowY: 'auto',
  zIndex: 1000
}; 