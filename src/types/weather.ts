export interface Coordinates {
  latitude: number;
  longitude: number;
}
export interface LocationData extends Coordinates {
  name: string;
  country?: string;
}
export interface CurrentWeather {
  time: string;
  temperature: number | null;
  apparentTemperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  rain: number | null;
  showers: number | null;
  weatherCode: number | null;
  cloudCover: number | null;
  pressure: number | null;
  windSpeed: number | null;
}
export interface HourlyWeather {
  precipitation: number | null;
  rain: number | null;
  showers: number | null;
  time: string;
  temperature: number | null;
  precipitationProbability: number | null;
  humidity: number | null;
  windSpeed: number | null;
  weatherCode: number | null;
}
export interface DailyWeather {
  precipitationSum: number | null;
  date: string;
  weatherCode: number | null;
  maxTemperature: number | null;
  minTemperature: number | null;
  precipitationProbability: number | null;
}
export interface WeatherData {
  timezone: string;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface LocationInfo {
  city?: string;
  district?: string;
  region?: string;
  country?: string;
  displayName: string;
}
export type CameraMode = "gps" | "search" | "manual";
export interface CameraRequest {
  id: number;
  coordinates: Coordinates;
  mode: CameraMode;
}
