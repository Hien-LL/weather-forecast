import { afterEach, expect, it, vi } from "vitest";
import {
  getCurrentCoordinates,
  mapGeolocationError,
} from "./geolocationService";
afterEach(() => vi.unstubAllGlobals());
it.each([
  [1, "denied"],
  [2, "unavailable"],
  [3, "timeout"],
  [99, "unavailable"],
])("maps GPS error %s to %s", (code, status) => {
  expect(mapGeolocationError(Number(code))).toBe(status);
});
it("handles an unsupported browser", async () => {
  vi.stubGlobal("navigator", {});
  vi.stubGlobal("window", { isSecureContext: true });
  await expect(getCurrentCoordinates()).rejects.toMatchObject({
    status: "unsupported",
  });
});
it("requests location only when invoked and passes the configured options", async () => {
  const getCurrentPosition = vi.fn((success: PositionCallback) =>
    success({
      coords: { latitude: 10.8, longitude: 106.6 },
    } as GeolocationPosition),
  );
  vi.stubGlobal("navigator", { geolocation: { getCurrentPosition } });
  vi.stubGlobal("window", { isSecureContext: true });
  expect(getCurrentPosition).not.toHaveBeenCalled();
  await expect(getCurrentCoordinates()).resolves.toEqual({
    latitude: 10.8,
    longitude: 106.6,
  });
  expect(getCurrentPosition.mock.calls[0]).toHaveLength(3);
  expect(getCurrentPosition).toHaveBeenCalledWith(
    expect.any(Function),
    expect.any(Function),
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
  );
});
it("maps a denied browser callback to a recoverable error", async () => {
  vi.stubGlobal("navigator", {
    geolocation: {
      getCurrentPosition: (
        _success: PositionCallback,
        error: PositionErrorCallback,
      ) => error({ code: 1 } as GeolocationPositionError),
    },
  });
  vi.stubGlobal("window", { isSecureContext: true });
  await expect(getCurrentCoordinates()).rejects.toMatchObject({
    status: "denied",
  });
});
