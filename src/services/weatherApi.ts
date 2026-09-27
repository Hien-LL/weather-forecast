import { WEATHER_API_URL } from "../constants/config";
import type { Coordinates, WeatherData } from "../types/weather";
type RecordData = Record<string, unknown>;
function object(value: unknown): RecordData {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid response");
  return value as RecordData;
}
function text(value: unknown): string {
  if (typeof value !== "string") throw new Error("Missing timestamp");
  return value;
}
function number(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("Invalid measurement");
  return value;
}
function times(value: unknown): string[] {
  if (!Array.isArray(value)) throw new Error("Missing forecast");
  return value.map(text);
}
function at(record: RecordData, key: string, index: number): number | null {
  const values = record[key];
  if (!Array.isArray(values)) throw new Error("Missing series");
  return number(values[index]);
}
export function parseWeather(payload: unknown): WeatherData {
  const data = object(payload),
    c = object(data.current),
    h = object(data.hourly),
    d = object(data.daily);
  const currentTime = text(c.time);
  const hours = times(h.time).map((time, i) => ({
    time,
    precipitation: at(h, "precipitation", i),
    rain: at(h, "rain", i),
    showers: at(h, "showers", i),
    temperature: at(h, "temperature_2m", i),
    precipitationProbability: at(h, "precipitation_probability", i),
    humidity: at(h, "relative_humidity_2m", i),
    windSpeed: at(h, "wind_speed_10m", i),
    weatherCode: at(h, "weather_code", i),
  }));
  return {
    timezone: text(data.timezone),
    current: {
      time: currentTime,
      temperature: number(c.temperature_2m),
      apparentTemperature: number(c.apparent_temperature),
      humidity: number(c.relative_humidity_2m),
      precipitation: number(c.precipitation),
      rain: number(c.rain),
      showers: number(c.showers),
      weatherCode: number(c.weather_code),
      cloudCover: number(c.cloud_cover),
      pressure: number(c.pressure_msl),
      windSpeed: number(c.wind_speed_10m),
    },
    hourly: hours
      .filter((hour) => hour.time >= `${currentTime.slice(0, 13)}:00`)
      .slice(0, 24),
    daily: times(d.time)
      .slice(0, 7)
      .map((date, i) => ({
        date,
        precipitationSum: at(d, "precipitation_sum", i),
        weatherCode: at(d, "weather_code", i),
        maxTemperature: at(d, "temperature_2m_max", i),
        minTemperature: at(d, "temperature_2m_min", i),
        precipitationProbability: at(d, "precipitation_probability_max", i),
      })),
  };
}
export async function fetchWeather(
  { latitude, longitude }: Coordinates,
  signal?: AbortSignal,
): Promise<WeatherData> {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    Math.abs(latitude) > 90 ||
    Math.abs(longitude) > 180
  )
    throw new Error("Invalid coordinates");
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,wind_speed_10m",
    hourly:
      "temperature_2m,precipitation_probability,precipitation,rain,showers,relative_humidity_2m,wind_speed_10m,weather_code",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
  });
  const response = await fetch(`${WEATHER_API_URL}?${params}`, { signal });
  if (!response.ok) throw new Error(`Weather API returned ${response.status}`);
  const payload: unknown = await response.json();
  return parseWeather(payload);
}
