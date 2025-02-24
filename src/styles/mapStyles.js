/**
 * Google Maps custom styling configuration
 */
export const mapStyles = [
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "poi",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e6e6e6" }]
  },
  {
    featureType: "road.arterial",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  {
    featureType: "road.local",
    elementType: "labels",
    stylers: [{ visibility: "simplified" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c8d7d4" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry.fill",
    stylers: [{ color: "#d5e7d6" }]
  },
  {
    featureType: "poi.business",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.text",
    stylers: [{ visibility: "simplified" }]
  }
];

// Landmark info panel styles
export const landmarkInfoStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  backgroundColor: 'white',
  borderRadius: '15px',
  padding: '2px',
  display: 'flex',
  gap: '15px',
  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  zIndex: 1000,
  maxWidth: '90%',
  width: '800px'
};

export const landmarkImageStyle = {
  width: '100px',
  height: '100px',
  borderRadius: '50%',
  objectFit: 'cover',
  border: '2px solid #FF69B4'
};

export const landmarkTextStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '10px'
};

export const buttonStyle = {
  border: 'none',
  padding: '6px 12px',
  borderRadius: '15px',
  cursor: 'pointer',
  fontSize: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '4px'
};

export const removeButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#FFE4E9',
  color: '#FF69B4',
  marginTop: '10px'
};

export const ratingStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '14px',
  color: '#666'
};

export const descriptionStyle = {
  margin: '8px 0 0 0',
  color: '#666',
  fontSize: '13px',
  lineHeight: '1.3',
  width: '100%'
};

export const landmarkTitleStyle = {
  margin: '0 0 4px 0',
  color: '#333',
  fontSize: '18px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

export const mapContainerStyle = {
  height: '100vh',
  width: '100vw',
  position: 'relative'
}; 