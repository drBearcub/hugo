import React from 'react';

const bubbleStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: '10px 15px',
  borderRadius: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  maxWidth: '60%',
  fontSize: '14px',
  lineHeight: '1.3',
  color: '#333',
  border: '1px solid rgba(0,0,0,0.1)',
  alignSelf: 'flex-start',
  position: 'relative',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '-8px',
  right: '-8px',
  width: '20px',
  height: '20px',
  borderRadius: '50%',
  backgroundColor: '#ff4444',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '12px',
};

const sectionStyle = {
  marginBottom: '8px',
};

const labelStyle = {
  fontWeight: 'bold',
  marginBottom: '3px',
  fontSize: '12px',
};

const contentStyle = {
  backgroundColor: 'rgba(0, 0, 0, 0.05)',
  padding: '6px',
  borderRadius: '6px',
  marginTop: '3px',
};

function TextBubble({ text, apiResponse, onClose, style }) {
  const getDisplayResponse = () => {
    if (!apiResponse) return null;
    try {
      const parsedResponse = JSON.parse(apiResponse.response);
      return parsedResponse.explanation;
    } catch (error) {
      return 'Error parsing response';
    }
  };

  return (
    <div style={{ ...bubbleStyle, ...style }}>
      <button style={closeButtonStyle} onClick={onClose}>×</button>
      
      <div style={sectionStyle}>
        <div style={labelStyle}>You said:</div>
        <div style={contentStyle}>{text}</div>
      </div>

      {apiResponse && (
        <div style={sectionStyle}>
          <div style={labelStyle}>AI Response:</div>
          <div style={contentStyle}>
            {getDisplayResponse()}
          </div>
        </div>
      )}
    </div>
  );
}

export default TextBubble; 