import {
  Sun,
  CloudSun,
  Cloud,
  CloudRain,
  CloudLightning,
  Snowflake,
  CloudFog,
  CircleHelp,
} from "lucide-react";
const RAIN_CODES = [51, 53, 55, 56, 57, 61, 63, 66, 67, 80, 81];
const HEAVY_RAIN_CODES = [65, 82];
const SNOW_CODES = [71, 73, 75, 77, 85, 86];
const THUNDER_CODES = [95, 96, 99];
export const isRainWeatherCode = (code: number | null) =>
  code !== null &&
  [...RAIN_CODES, ...HEAVY_RAIN_CODES, ...THUNDER_CODES].includes(code);
export const isSnowWeatherCode = (code: number | null) =>
  code !== null && SNOW_CODES.includes(code);
export function getWeatherPresentation(code: number | null) {
  if (code === 0) return { label: "Clear Sky", Icon: Sun };
  if (code === 1 || code === 2)
    return { label: "Partly Cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Cloudy", Icon: Cloud };
  if (code === 45 || code === 48) return { label: "Fog", Icon: CloudFog };
  if (code !== null && RAIN_CODES.includes(code))
    return { label: "Rain", Icon: CloudRain };
  if (code !== null && HEAVY_RAIN_CODES.includes(code))
    return { label: "Heavy Rain", Icon: CloudRain };
  if (code !== null && SNOW_CODES.includes(code))
    return { label: "Snow", Icon: Snowflake };
  if (code !== null && THUNDER_CODES.includes(code))
    return { label: "Thunderstorm", Icon: CloudLightning };
  return { label: "Unavailable", Icon: CircleHelp };
}
