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