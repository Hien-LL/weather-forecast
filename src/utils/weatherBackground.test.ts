import { describe, expect, it } from "vitest";
import {
  getWeatherBackground,
  getWeatherBackgroundKind,
} from "./weatherBackground";
describe("weather photograph selection", () => {
  it.each([
    [0, true, "clear-day"],
    [0, false, "clear-night"],
    [0, null, "cloudy"],
    [1, true, "cloudy"],
    [3, false, "cloudy"],
    [61, true, "rain"],
    [82, false, "rain"],
    [95, true, "thunderstorm"],
    [99, false, "thunderstorm"],
    [73, true, "snow"],
    [86, false, "snow"],
    [45, true, "fog"],
    [48, false, "fog"],
    [null, null, "cloudy"],
    [999, true, "cloudy"],
  ] as const)("maps code %s / daylight %s to %s", (code, day, kind) => {
    expect(getWeatherBackgroundKind(code, day)).toBe(kind);
  });
  it("bundles distinct local assets and a gradient fallback for every condition", () => {
    const backgrounds = [
      getWeatherBackground(0, true),
      getWeatherBackground(0, false),
      getWeatherBackground(3, true),
      getWeatherBackground(61, true),
      getWeatherBackground(95, true),
      getWeatherBackground(73, true),
      getWeatherBackground(45, true),
    ];
    expect(new Set(backgrounds.map((item) => item.src)).size).toBe(7);
    for (const item of backgrounds) {
      expect(item.src).toContain(`${item.kind}.png`);
      expect(item.fallback).toContain("linear-gradient");
    }
  });
});
