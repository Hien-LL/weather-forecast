import type { HourlyWeather, WeatherData } from "../types/weather";
import { isRainWeatherCode, isSnowWeatherCode } from "./weatherCode";
export const RAIN_PROBABILITY_THRESHOLD = 50;
export interface RainForecastSummary {
  isRainingNow: boolean;
  currentRainMm: number | null;
  currentKnown: boolean;
  nextHourProbability: number | null;
  maxProbabilityNext3Hours: number | null;
  maxProbabilityNext6Hours: number | null;
  likelyRainSoon: boolean;
  nextLikelyRainTime: string | null;
  nextLikelyRainProbability: number | null;
  highestChanceTime: string | null;
  highestChanceProbability: number | null;
  completeNext12Hours: boolean;
}
const maximum = (hours: HourlyWeather[]) => {
  const values = hours.flatMap((hour) =>
    hour.precipitationProbability === null
      ? []
      : [hour.precipitationProbability],
  );
  return values.length ? Math.max(...values) : null;
};
// Interpret wall-clock ISO values in one neutral frame; never use the browser timezone.
const localHour = (time: string) => Date.parse(`${time.slice(0, 13)}:00:00Z`);
export function summarizeRain(weather: WeatherData): RainForecastSummary {
  const { current } = weather;
  const hasRain = (current.rain ?? 0) > 0 || (current.showers ?? 0) > 0;
  const precipitationFallback =
    current.rain === null &&
    current.showers === null &&
    !isSnowWeatherCode(current.weatherCode);
  const currentRainMm =
    current.rain === null && current.showers === null
      ? precipitationFallback
        ? current.precipitation
        : null
      : (current.rain ?? 0) + (current.showers ?? 0);
  const currentKnown =
    current.rain !== null ||
    current.showers !== null ||
    current.weatherCode !== null;
  const isRainingNow =
    hasRain ||
    isRainWeatherCode(current.weatherCode) ||
    (precipitationFallback && (current.precipitation ?? 0) > 0);
  const now = localHour(current.time);
  const future = weather.hourly
    .map((hour) => ({ hour, offset: (localHour(hour.time) - now) / 3600000 }))
    .filter(({ offset }) => offset >= 1 && offset <= 12)
    .sort((a, b) => a.offset - b.offset);
  const within = (count: number) =>
    future.filter(({ offset }) => offset <= count).map(({ hour }) => hour);
  const likely = future.find(
    ({ hour }) =>
      (hour.precipitationProbability ?? -1) >= RAIN_PROBABILITY_THRESHOLD &&
      (!isSnowWeatherCode(hour.weatherCode) ||
        (hour.rain ?? 0) + (hour.showers ?? 0) > 0),
  );
  const highest = future
    .filter(({ hour }) => hour.precipitationProbability !== null)
    .sort(
      (a, b) =>
        b.hour.precipitationProbability! - a.hour.precipitationProbability!,
    )[0]?.hour;
  return {
    isRainingNow,
    currentRainMm,
    currentKnown: currentKnown || (currentRainMm !== null && currentRainMm > 0),
    nextHourProbability:
      future.find(({ offset }) => offset === 1)?.hour
        .precipitationProbability ?? null,
    maxProbabilityNext3Hours: maximum(within(3)),
    maxProbabilityNext6Hours: maximum(within(6)),
    likelyRainSoon: !!likely && likely.offset <= 6,
    nextLikelyRainTime: likely?.hour.time ?? null,
    nextLikelyRainProbability: likely?.hour.precipitationProbability ?? null,
    highestChanceTime: highest?.time ?? null,
    highestChanceProbability: highest?.precipitationProbability ?? null,
    completeNext12Hours:
      new Set(
        future
          .filter(({ hour }) => hour.precipitationProbability !== null)
          .map(({ offset }) => offset),
      ).size === 12,
  };
}
