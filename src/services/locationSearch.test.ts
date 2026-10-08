import { afterEach, describe, expect, it, vi } from "vitest";
const config = vi.hoisted(() => ({
  MAPBOX_TOKEN: "pk.test" as string | undefined,
  MAPBOX_TOKEN_ERROR: null as string | null,
}));
vi.mock("../constants/config", () => config);
import { parseSearchResults, searchLocations } from "./locationSearch";
const place = (properties: Record<string, unknown> = {}, id = "paris") => ({
  type: "Feature",
  id,
  geometry: { type: "Point", coordinates: [2.35, 48.85] },
  properties: {
    mapbox_id: id,
    feature_type: "place",
    name: "Paris",
    coordinates: { longitude: 2.35, latitude: 48.85 },
    context: {
      place: { name: "Paris" },
      region: { name: "Paris" },
      country: { name: "France", country_code: "FR" },
    },
    ...properties,
  },
});
const response = (features: unknown[]) => ({ features });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
  config.MAPBOX_TOKEN = "pk.test";
  config.MAPBOX_TOKEN_ERROR = null;
});
describe("Mapbox v6 normalization", () => {
  it("normalizes coordinates, metadata and duplicate label pieces", () => {
    expect(parseSearchResults(response([place()]))[0]).toEqual({
      id: "paris",
      name: "Paris",
      city: "Paris",
      region: "Paris",
      country: "France",
      countryCode: "FR",
      latitude: 48.85,
      longitude: 2.35,
      displayName: "Paris, France",
      contextLabel: "France",
    });
  });
  it("accepts absent optional context and GeoJSON coordinates", () => {
    expect(
      parseSearchResults(
        response([place({ coordinates: undefined, context: undefined })]),
      )[0],
    ).toMatchObject({
      name: "Paris",
      latitude: 48.85,
      longitude: 2.35,
      displayName: "Paris",
      contextLabel: "",
    });
  });
  it.each([null, "48", NaN, Infinity, 91, -91])(
    "ignores invalid latitude %s",
    (latitude) => {
      // Null explicitly invalid: the GeoJSON fallback is removed for this case.
      const feature = place({ coordinates: { latitude, longitude: 2 } });
      expect(
        parseSearchResults(response([{ ...feature, geometry: undefined }])),
      ).toEqual([]);
    },
  );
  it("rejects longitude outside range and businesses, tolerates malformed features", () => {
    expect(
      parseSearchResults(
        response([
          null,
          {},
          place({ coordinates: { latitude: 20, longitude: 181 } }),
          place({ feature_type: "poi" }),
        ]),
      ),
    ).toEqual([]);
  });
  it("deduplicates IDs, but preserves distinct places sharing a name", () => {
    expect(
      parseSearchResults(
        response([place(), place(), place({}, "paris-texas")]),
      ),
    ).toHaveLength(2);
  });
  it("limits results to six and supports Unicode names", () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      place({ name: "Hồ Chí Minh", context: {} }, String(i)),
    );
    const results = parseSearchResults(response(items));
    expect(results).toHaveLength(6);
    expect(results[0].name).toBe("Hồ Chí Minh");
  });
  it("rejects a malformed top-level response", () => {
    expect(() => parseSearchResults({})).toThrow("Unable to search");
  });
});
describe("forward request lifecycle", () => {
  it("does not request blank or one-character queries", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await searchLocations(" ")).toEqual([]);
    expect(await searchLocations("北")).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("encodes Unicode and uses geographic types, six results, no proximity", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => response([place()]) });
    vi.stubGlobal("fetch", fetcher);
    await searchLocations(" Hồ Chí Minh ");
    const url = fetcher.mock.calls[0][0] as URL;
    expect(url.pathname).toBe("/search/geocode/v6/forward");
    expect(url.searchParams.get("q")).toBe("Hồ Chí Minh");
    expect(url.searchParams.get("limit")).toBe("6");
    expect(url.searchParams.get("types")).toBe(
      "place,locality,district,region,country",
    );
    expect(url.searchParams.has("proximity")).toBe(false);
  });
  it("handles missing and invalid tokens without HTTP", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    config.MAPBOX_TOKEN = undefined;
    await expect(searchLocations("Tokyo")).rejects.toThrow(
      "Mapbox access token",
    );
    config.MAPBOX_TOKEN = "sk.invalid";
    config.MAPBOX_TOKEN_ERROR = "invalid";
    await expect(searchLocations("Tokyo")).rejects.toThrow(
      "Mapbox access token",
    );
    expect(fetcher).not.toHaveBeenCalled();
  });
  it.each([401, 429, 500])(
    "handles HTTP %s without exposing the token",
    async (status) => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status }));
      await expect(searchLocations("Tokyo")).rejects.toThrow(
        "Unable to search locations. Please try again.",
      );
    },
  );
  it("handles network failure and malformed JSON", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(searchLocations("Tokyo")).rejects.toThrow("Unable to search");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          throw new Error("bad json");
        },
      }),
    );
    await expect(searchLocations("Tokyo")).rejects.toThrow("Unable to search");
  });
  const abortableFetch = () =>
    vi.fn(
      (_url: URL, options: RequestInit) =>
        new Promise((_resolve, reject) =>
          options.signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          ),
        ),
    );
  it("forwards caller cancellation and handles pre-aborted signals", async () => {
    const fetcher = abortableFetch();
    vi.stubGlobal("fetch", fetcher);
    const controller = new AbortController();
    const request = searchLocations("Tokyo", controller.signal);
    const assertion = expect(request).rejects.toMatchObject({
      name: "AbortError",
    });
    controller.abort();
    await assertion;
    await expect(
      searchLocations("Tokyo", controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("times out after ten seconds with a retryable message", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", abortableFetch());
    const assertion = expect(searchLocations("Tokyo")).rejects.toThrow(
      "Unable to search",
    );
    await vi.advanceTimersByTimeAsync(10000);
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
  });
});
