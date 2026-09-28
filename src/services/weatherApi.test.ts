import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWeather, parseWeather } from "./weatherApi";
import { getWeatherPresentation } from "../utils/weatherCode";
function fixture() {
  const time = Array.from(
    { length: 48 },
    (_, i) =>
      `2026-09-${i < 24 ? "27" : "28"}T${String(i % 24).padStart(2, "0")}:00`,
  );
  const series = (n: number) => Array.from({ length: 48 }, () => n);
  return {
    timezone: "Asia/Ho_Chi_Minh",
    current: {
      time: "2026-09-27T18:15",
      temperature_2m: 31,
      apparent_temperature: 34,
      relative_humidity_2m: 74,
      precipitation: 0.2,
      rain: 0.2,
      showers: 0,
      weather_code: 3,
      cloud_cover: 80,
      pressure_msl: 1008,
      wind_speed_10m: 13,
    },
    hourly: {
      time,
      temperature_2m: series(30),
      precipitation: series(0.2),
      rain: series(0.2),
      showers: series(0),
      precipitation_probability: series(35),
      relative_humidity_2m: series(74),
      wind_speed_10m: series(13),
      weather_code: series(3),
    },
    daily: {
      time: ["2026-09-27"],
      weather_code: [3],
      temperature_2m_max: [34],
      temperature_2m_min: [27],
      precipitation_probability_max: [35],
      precipitation_sum: [1.2],
    },
  };
}
afterEach(() => vi.unstubAllGlobals());
describe("weather boundary", () => {
  it("returns 24 hours from the current location hour, across midnight", () => {
    const data = parseWeather(fixture());
    expect(data.hourly).toHaveLength(24);
    expect(data.hourly[0].time).toBe("2026-09-27T18:00");
    expect(data.hourly[23].time).toBe("2026-09-28T17:00");
    expect(data.current.temperature).toBe(31);
    expect(data.current.rain).toBe(0.2);
    expect(data.hourly[0].showers).toBe(0);
    expect(data.daily[0].precipitationSum).toBe(1.2);
    expect(data.timezone).toBe("Asia/Ho_Chi_Minh");
  });
  it("preserves missing measurements without manufacturing zero", () => {
    const payload = fixture();
    const data = parseWeather({
      ...payload,
      current: { ...payload.current, temperature_2m: null },
    });
    expect(data.current.temperature).toBeNull();
  });
  it("rejects malformed payloads", () => {
    expect(() => parseWeather({})).toThrow();
    const payload = fixture();
    payload.hourly.temperature_2m = [];
    expect(() => parseWeather(payload)).toThrow();
  });
  it("accepts zero coordinates, requests required units and passes cancellation", async () => {
    const mock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => fixture() });
    vi.stubGlobal("fetch", mock);
    const signal = new AbortController().signal;
    await fetchWeather({ latitude: 0, longitude: 0 }, signal);
    const url = new URL(mock.mock.calls[0][0] as string);
    expect(url.searchParams.get("latitude")).toBe("0");
    expect(url.searchParams.get("wind_speed_unit")).toBe("kmh");
    expect(mock.mock.calls[0][1]).toEqual({ signal });
    expect(url.searchParams.get("current")).toContain("rain,showers");
    expect(url.searchParams.get("current")).toContain("is_day");
    expect(url.searchParams.get("hourly")).toContain(
      "precipitation,rain,showers",
    );
    expect(url.searchParams.get("daily")).toContain("precipitation_sum");
  });
  it("rejects non-success API responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 429 }),
    );
    await expect(
      fetchWeather({ latitude: 10, longitude: 106 }),
    ).rejects.toThrow("429");
  });
  it("rejects invalid coordinates before making a request", async () => {
    const mock = vi.fn();
    vi.stubGlobal("fetch", mock);
    await expect(
      fetchWeather({ latitude: 91, longitude: 0 }),
    ).rejects.toThrow();
    expect(mock).not.toHaveBeenCalled();
  });
  it("maps severe weather and unknown codes", () => {
    expect(getWeatherPresentation(99).label).toBe("Thunderstorm");
    expect(getWeatherPresentation(82).label).toBe("Heavy Rain");
    expect(getWeatherPresentation(86).label).toBe("Snow");
    expect(getWeatherPresentation(null).label).toBe("Unavailable");
  });
  it("rejects missing rain fields and malformed daily precipitation", () => {
    const payload = fixture();
    const { rain: _rain, ...withoutRain } = payload.current;
    expect(() => parseWeather({ ...payload, current: withoutRain })).toThrow();
    expect(() =>
      parseWeather({
        ...payload,
        daily: { ...payload.daily, precipitation_sum: ["invalid"] },
      }),
    ).toThrow();
  });
  it("preserves null rain measurements in current and hourly data", () => {
    const payload = fixture();
    const parsed = parseWeather({
      ...payload,
      current: { ...payload.current, rain: null },
      hourly: { ...payload.hourly, rain: payload.hourly.rain.map(() => null) },
    });
    expect(parsed.current.rain).toBeNull();
    expect(parsed.hourly[0].rain).toBeNull();
  });
  it("uses the API daylight flag without guessing from browser time", () => {
    const payload = fixture();
    expect(
      parseWeather({ ...payload, current: { ...payload.current, is_day: 1 } })
        .current.isDay,
    ).toBe(true);
    expect(
      parseWeather({ ...payload, current: { ...payload.current, is_day: 0 } })
        .current.isDay,
    ).toBe(false);
    expect(parseWeather(payload).current.isDay).toBeNull();
  });
});
