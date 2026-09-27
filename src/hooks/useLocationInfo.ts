import { useEffect, useState } from "react";
import { reverseGeocode } from "../services/geocodingApi";
import type { LocationData } from "../types/weather";
export function useLocationInfo(location: LocationData | null) {
  const [resolved, setResolved] = useState<{
    source: LocationData;
    location: LocationData;
  } | null>(null);
  useEffect(() => {
    if (!location) return;
    const controller = new AbortController();
    void reverseGeocode(location, controller.signal).then((info) => {
      if (!controller.signal.aborted)
        setResolved({
          source: location,
          location: {
            ...location,
            name:
              info.city || info.district || info.region || info.country
                ? info.displayName
                : location.name,
            country: info.country ?? location.country,
          },
        });
    });
    return () => controller.abort();
  }, [location]);
  return resolved?.source === location ? resolved.location : location;
}
