import { MAPBOX_TOKEN, MAPBOX_TOKEN_ERROR } from "../constants/config";
import type { LocationSearchResult } from "../types/weather";
export const SEARCH_MIN_LENGTH = 2;
const RESULT_LIMIT = 6;
const TYPES = ["place", "locality", "district", "region", "country"];
const SEARCH_ERROR = "Unable to search locations. Please try again.";
function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}
function text(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}
export function parseSearchResults(payload: unknown): LocationSearchResult[] {
  const features = record(payload).features;
  if (!Array.isArray(features)) throw new Error(SEARCH_ERROR);
  const results: LocationSearchResult[] = [];
  const ids = new Set<string>();
  for (const raw of features) {
    const feature = record(raw),
      properties = record(feature.properties);
    const id = text(properties.mapbox_id) ?? text(feature.id);
    const name = text(properties.name_preferred) ?? text(properties.name);
    const type = text(properties.feature_type);
    const point = record(properties.coordinates);
    const geometry = record(feature.geometry);
    const coords =
      geometry.type === "Point" && Array.isArray(geometry.coordinates)
        ? geometry.coordinates
        : [];
    const longitude = point.longitude ?? coords[0],
      latitude = point.latitude ?? coords[1];
    if (
      !id ||
      !name ||
      !type ||
      !TYPES.includes(type) ||
      ids.has(id) ||
      typeof latitude !== "number" ||
      !Number.isFinite(latitude) ||
      Math.abs(latitude) > 90 ||
      typeof longitude !== "number" ||
      !Number.isFinite(longitude) ||
      Math.abs(longitude) > 180
    )
      continue;
    const context = record(properties.context);
    const city = type === "place" ? name : text(record(context.place).name);
    const region = type === "region" ? name : text(record(context.region).name);
    const country =
      type === "country" ? name : text(record(context.country).name);
    const countryCode = text(record(context.country).country_code);
    const pieces = [name];
    for (const piece of [city, region, country]) {
      if (
        piece &&
        !pieces.some(
          (existing) =>
            existing.toLocaleLowerCase() === piece.toLocaleLowerCase(),
        )
      )
        pieces.push(piece);
    }
    results.push({
      id,
      name,
      city,
      region,
      country,
      countryCode,
      latitude,
      longitude,
      displayName: pieces.join(", "),
      contextLabel: pieces.slice(1).join(", "),
    });
    ids.add(id);
    if (results.length === RESULT_LIMIT) break;
  }
  return results;
}
export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<LocationSearchResult[]> {
  const trimmed = query.trim();
  if (Array.from(trimmed).length < SEARCH_MIN_LENGTH) return [];
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN_ERROR)
    throw new Error(
      "Location search requires a valid public Mapbox access token.",
    );
  signal?.throwIfAborted();
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 10000);
  const url = new URL("https://api.mapbox.com/search/geocode/v6/forward");
  url.search = new URLSearchParams({
    q: trimmed,
    access_token: MAPBOX_TOKEN,
    types: TYPES.join(","),
    limit: String(RESULT_LIMIT),
    autocomplete: "true",
    language: "en",
  }).toString();
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(SEARCH_ERROR);
    return parseSearchResults(await response.json());
  } catch {
    if (signal?.aborted)
      throw new DOMException("Search cancelled", "AbortError");
    throw new Error(SEARCH_ERROR);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
