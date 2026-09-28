import { describe, expect, it } from "vitest";
import { summarizeRain } from "./rainForecast";
import type { WeatherData } from "../types/weather";
function forecast(
  probabilities: (number | null)[] = [10, 30, 75, 20, 60, 10, 0, 0, 0, 0, 0, 0],
): WeatherData {
  return {
    timezone: "Asia/Ho_Chi_Minh",
    current: {
      isDay: true,
      time: "2026-09-27T18:15",
      temperature: 30,
      apparentTemperature: 31,
      humidity: 75,
      precipitation: 0,
      rain: 0,
      showers: 0,
      weatherCode: 3,
      cloudCover: 60,
      pressure: 1008,
      windSpeed: 12,
    },
    daily: [],
    hourly: [99, ...probabilities].map((precipitationProbability, index) => ({
      time: new Date(Date.UTC(2026, 8, 27, 18 + index))
        .toISOString()
        .slice(0, 16),
      temperature: 30,
      precipitationProbability,
      precipitation: 0,
      rain: 0,
      showers: 0,
      humidity: 70,
      windSpeed: 12,
      weatherCode: 3,
    })),
  };
}
describe("rain outlook", () => {
  it("uses actual current rain instead of probability", () => {
    const data = forecast();
    data.current.rain = 0.8;
    expect(summarizeRain(data).isRainingNow).toBe(true);
    expect(summarizeRain(data).currentRainMm).toBe(0.8);
  });
  it("keeps a dry current interval dry even when probability is 99%", () => {
    expect(summarizeRain(forecast()).isRainingNow).toBe(false);
  });
  it("recognizes showers and rain-related weather codes", () => {
    const data = forecast();
    data.current.showers = 0.3;
    expect(summarizeRain(data).isRainingNow).toBe(true);
    data.current.showers = 0;
    data.current.weatherCode = 95;
    expect(summarizeRain(data).isRainingNow).toBe(true);
  });
  it("excludes the current hour and computes the next 1/3/6-hour peaks", () => {
    const result = summarizeRain(forecast());
    expect(result.nextHourProbability).toBe(10);
    expect(result.maxProbabilityNext3Hours).toBe(75);
    expect(result.maxProbabilityNext6Hours).toBe(75);
    expect(result.nextLikelyRainTime).toBe("2026-09-27T21:00");
    expect(result.likelyRainSoon).toBe(true);
  });
  it("uses an inclusive 50% threshold across local midnight", () => {
    const result = summarizeRain(forecast([0, 0, 0, 0, 0, 50]));
    expect(result.nextLikelyRainTime).toBe("2026-09-28T00:00");
  });
  it("reports missing data instead of claiming a dry 12-hour outlook", () => {
    const result = summarizeRain(forecast([null, null, null]));
    expect(result.nextHourProbability).toBeNull();
    expect(result.maxProbabilityNext3Hours).toBeNull();
    expect(result.completeNext12Hours).toBe(false);
  });
  it("does not interpret snowfall as current or future rain", () => {
    const data = forecast();
    data.current.rain = null;
    data.current.showers = null;
    data.current.precipitation = 1;
    data.current.weatherCode = 73;
    data.hourly.forEach((hour) => {
      hour.weatherCode = 73;
      hour.precipitationProbability = 90;
    });
    const result = summarizeRain(data);
    expect(result.isRainingNow).toBe(false);
    expect(result.nextLikelyRainTime).toBeNull();
  });
  it("preserves an unknown current rain state", () => {
    const data = forecast();
    data.current.rain = null;
    data.current.showers = null;
    data.current.precipitation = null;
    data.current.weatherCode = null;
    const result = summarizeRain(data);
    expect(result.currentKnown).toBe(false);
    expect(result.currentRainMm).toBeNull();
  });
  it("uses non-snow precipitation when liquid components are unavailable", () => {
    const data = forecast();
    data.current.rain = null;
    data.current.showers = null;
    data.current.precipitation = 0.5;
    expect(summarizeRain(data).isRainingNow).toBe(true);
  });
  it("limits the next 12 hours by timestamps rather than array length", () => {
    const data = forecast([0, 0, 0]);
    data.hourly.push({
      ...data.hourly[0],
      time: "2026-09-28T08:00",
      precipitationProbability: 100,
    });
    const result = summarizeRain(data);
    expect(result.nextLikelyRainTime).toBeNull();
    expect(result.maxProbabilityNext3Hours).toBe(0);
  });
  it("reports no significant rain only when all 12 hours are present", () => {
    const result = summarizeRain(forecast(Array(12).fill(10)));
    expect(result.completeNext12Hours).toBe(true);
    expect(result.nextLikelyRainTime).toBeNull();
  });
});
