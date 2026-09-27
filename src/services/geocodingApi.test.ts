import { expect, it, vi, afterEach } from "vitest";
vi.mock("../constants/config", () => ({
  MAPBOX_TOKEN: "pk.test",
  MAPBOX_TOKEN_ERROR: null,
}));
import {
  coordinateLabel,
  parseLocationInfo,
  reverseGeocode,
} from "./geocodingApi";
const coordinates = { latitude: 10.8231, longitude: 106.6297 };
afterEach(() => vi.unstubAllGlobals());
it("reads city and country from Mapbox v6 context", () => {
  const info = parseLocationInfo(
    {
      features: [
        {
          properties: {
            feature_type: "place",
            name: "Ho Chi Minh City",
            context: {
              country: { name: "Vietnam" },
              region: { name: "Ho Chi Minh" },
            },
          },
        },
      ],
    },
    coordinates,
  );
  expect(info.city).toBe("Ho Chi Minh City");
  expect(info.country).toBe("Vietnam");
});
it("formats fallback coordinates with correct hemispheres", () => {
  expect(coordinateLabel({ latitude: -33.8688, longitude: -74.006 })).toBe(
    "33.8688° S, 74.0060° W",
  );
});
it("keeps empty/ocean results usable", () => {
  expect(parseLocationInfo({ features: [] }, coordinates).displayName).toBe(
    coordinateLabel(coordinates),
  );
});
it("returns coordinates after a failed geocoding request", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  await expect(reverseGeocode(coordinates)).resolves.toEqual({
    displayName: coordinateLabel(coordinates),
  });
});
it("returns coordinates after a bad response", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ invalid: true }) }),
  );
  await expect(reverseGeocode(coordinates)).resolves.toEqual({
    displayName: coordinateLabel(coordinates),
  });
});
