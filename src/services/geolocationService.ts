import type { Coordinates } from "../types/weather";
export type GeolocationStatus =
  | "idle"
  | "requesting"
  | "success"
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported";
export type GeolocationFailure = Exclude<
  GeolocationStatus,
  "idle" | "requesting" | "success"
>;
export const LOCATION_MESSAGES: Record<GeolocationStatus, string> = {
  idle: "Use your current location to show local weather.",
  requesting: "Locating you...",
  success: "Location found. Preparing your forecast.",
  denied:
    "Location access was denied. You can still explore Earth manually or search for a city.",
  unavailable: "Your location is unavailable. Try again or explore manually.",
  timeout:
    "Finding your location took too long. Try again or search for a city.",
  unsupported:
    "Location is not supported here. Use HTTPS or localhost, or explore manually.",
};
export class LocationError extends Error {
  constructor(public status: GeolocationFailure) {
    super(LOCATION_MESSAGES[status]);
  }
}
export const mapGeolocationError = (code: number): GeolocationFailure =>
  code === 1 ? "denied" : code === 3 ? "timeout" : "unavailable";
// Called only from an explicit user action, never on mount.
export function getCurrentCoordinates(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation || !window.isSecureContext) {
      reject(new LocationError("unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) =>
        resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      (error) => reject(new LocationError(mapGeolocationError(error.code))),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  });
}
