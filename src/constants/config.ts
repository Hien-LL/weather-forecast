import type { LocationData } from "../types/weather";
export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim();
export const MAPBOX_TOKEN_ERROR = !MAPBOX_TOKEN
  ? "Mapbox access token is missing."
  : !MAPBOX_TOKEN.startsWith("pk.")
    ? "A valid public Mapbox token is required. Replace the placeholder in .env.local."
    : null;
export const INITIAL_ZOOM = 1.4;
export const INITIAL_CENTER: [number, number] = [106.6297, 10.8231];
export const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
export const SAMPLE_LOCATIONS: LocationData[] = [
  {
    name: "Ho Chi Minh City",
    country: "Vietnam",
    latitude: 10.8231,
    longitude: 106.6297,
  },
  { name: "Hanoi", country: "Vietnam", latitude: 21.0285, longitude: 105.8542 },
  {
    name: "Da Nang",
    country: "Vietnam",
    latitude: 16.0544,
    longitude: 108.2022,
  },
  {
    name: "Singapore",
    country: "Singapore",
    latitude: 1.3521,
    longitude: 103.8198,
  },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503 },
  {
    name: "London",
    country: "United Kingdom",
    latitude: 51.5074,
    longitude: -0.1278,
  },
  {
    name: "New York",
    country: "United States",
    latitude: 40.7128,
    longitude: -74.006,
  },
  {
    name: "Sydney",
    country: "Australia",
    latitude: -33.8688,
    longitude: 151.2093,
  },
];
