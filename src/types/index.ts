export interface Landmark {
  name: string;
  latitude: number;
  longitude: number;
  rating?: number;
  types?: string[];
  photoUrl?: string | null;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface ApiResponse {
  // Add your API response type here
  [key: string]: any;
} 