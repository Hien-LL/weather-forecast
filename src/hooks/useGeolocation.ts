import { useCallback, useEffect, useRef, useState } from "react";
import {
  getCurrentCoordinates,
  LocationError,
  type GeolocationStatus,
} from "../services/geolocationService";
export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>("idle");
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
    },
    [],
  );
  const cancel = useCallback(() => {
    generation.current++;
    setStatus("idle");
  }, []);
  const request = useCallback(async () => {
    const id = ++generation.current;
    setStatus("requesting");
    try {
      const coordinates = await getCurrentCoordinates();
      if (id !== generation.current) return null;
      setStatus("success");
      return coordinates;
    } catch (error) {
      if (id === generation.current)
        setStatus(
          error instanceof LocationError ? error.status : "unavailable",
        );
      return null;
    }
  }, []);
  return { status, request, cancel };
}
