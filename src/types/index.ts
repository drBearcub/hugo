export interface Landmark {
  name: string;
  latitude: number;
  longitude: number;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ApiResponse {
  // Add your API response type here
  [key: string]: any;
} 