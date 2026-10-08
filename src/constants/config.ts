export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN?.trim();
export const MAPBOX_TOKEN_ERROR = !MAPBOX_TOKEN
  ? "Mapbox access token is missing."
  : !MAPBOX_TOKEN.startsWith("pk.")
    ? "A valid public Mapbox token is required. Replace the placeholder in .env.local."
    : null;
export const INITIAL_ZOOM = 1.4;
export const INITIAL_CENTER: [number, number] = [106.6297, 10.8231];
export const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
