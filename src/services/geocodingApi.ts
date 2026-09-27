import { MAPBOX_TOKEN, MAPBOX_TOKEN_ERROR } from "../constants/config";
import type { Coordinates, LocationInfo } from "../types/weather";
export function coordinateLabel({ latitude, longitude }: Coordinates) {
  return `${Math.abs(latitude).toFixed(4)}° ${latitude < 0 ? "S" : "N"}, ${Math.abs(longitude).toFixed(4)}° ${longitude < 0 ? "W" : "E"}`;
}
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}
export function parseLocationInfo(
  payload: unknown,
  coordinates: Coordinates,
): LocationInfo {
  const features = record(payload).features;
  if (!Array.isArray(features)) throw new Error("Invalid geocoding response");
  const names: Record<string, string> = {};
  for (const feature of features) {
    const properties = record(record(feature).properties);
    const context = record(properties.context);
    for (const key of ["place", "district", "region", "country"]) {
      const name = record(context[key]).name;
      if (typeof name === "string" && !names[key]) names[key] = name;
    }
    if (
      typeof properties.feature_type === "string" &&
      typeof properties.name === "string"
    )
      names[properties.feature_type] = properties.name;
  }
  return {
    city: names.place,
    district: names.district,
    region: names.region,
    country: names.country,
    displayName:
      names.place ??
      names.district ??
      names.region ??
      names.country ??
      coordinateLabel(coordinates),
  };
}
export async function reverseGeocode(
  coordinates: Coordinates,
  signal?: AbortSignal,
): Promise<LocationInfo> {
  const fallback = { displayName: coordinateLabel(coordinates) };
  if (MAPBOX_TOKEN_ERROR || !MAPBOX_TOKEN) return fallback;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 8000);
  try {
    const params = new URLSearchParams({
      latitude: String(coordinates.latitude),
      longitude: String(coordinates.longitude),
      types: "place,district,region,country",
      language: "en",
      access_token: MAPBOX_TOKEN,
    });
    const response = await fetch(
      `https://api.mapbox.com/search/geocode/v6/reverse?${params}`,
      { signal: controller.signal },
    );
    if (!response.ok) return fallback;
    const payload: unknown = await response.json();
    return parseLocationInfo(payload, coordinates);
  } catch {
    return fallback;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
