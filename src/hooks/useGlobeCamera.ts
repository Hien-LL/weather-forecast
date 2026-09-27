import { useCallback, useEffect, useRef, useState } from "react";
import type { Map } from "mapbox-gl";
import { INITIAL_ZOOM } from "../constants/config";
import type { CameraRequest } from "../types/weather";
export function useGlobeCamera(
  map: Map | null,
  request: CameraRequest | null,
  unavailable: boolean,
  onSettled: (id: number) => void,
  stopRotation: () => void,
) {
  const [arrivedId, setArrivedId] = useState<number | null>(null);
  const cancelFlight = useRef<(() => void) | null>(null);
  const settled = useRef(onSettled);
  useEffect(() => {
    settled.current = onSettled;
  }, [onSettled]);
  const interrupt = useCallback(() => {
    stopRotation();
    cancelFlight.current?.();
  }, [stopRotation]);
  useEffect(() => {
    if (!request) return;
    stopRotation();
    if (unavailable) {
      settled.current(request.id);
      return;
    }
    if (!map) return;
    map.stop();
    let active = true;
    let next: (() => void) | null = null;
    const detach = () => {
      if (next) map.off("moveend", next);
      next = null;
    };
    const finish = () => {
      if (!active) return;
      active = false;
      detach();
      cancelFlight.current = null;
      setArrivedId(request.id);
      settled.current(request.id);
    };
    // An explicit user gesture takes over the camera; it must not leave the UI waiting.
    cancelFlight.current = () => {
      detach();
      map.stop();
      finish();
    };
    const center: [number, number] = [
      request.coordinates.longitude,
      request.coordinates.latitude,
    ];
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const stage = (run: () => void, after: () => void) => {
      detach();
      next = after;
      map.once("moveend", after);
      run();
      // Mapbox may emit no moveend for an unchanged camera.
      if (!map.isMoving() && next === after && active) {
        detach();
        after();
      }
    };
    const zoomToCity = () => {
      if (!active) return;
      stage(
        () =>
          map.flyTo({
            center,
            zoom: 9,
            pitch: 0,
            bearing: 0,
            duration: request.mode === "gps" ? 3000 : 2000,
          }),
        finish,
      );
    };
    if (reduced) {
      map.jumpTo({
        center,
        zoom: request.mode === "manual" ? map.getZoom() : 9,
        pitch: 0,
        bearing: 0,
      });
      finish();
    } else if (request.mode === "manual")
      stage(() => map.easeTo({ center, duration: 650 }), finish);
    else {
      const rotate = () => {
        if (active)
          stage(
            () =>
              map.easeTo({
                center,
                zoom: INITIAL_ZOOM,
                pitch: 0,
                bearing: 0,
                duration: request.mode === "gps" ? 1600 : 900,
              }),
            zoomToCity,
          );
      };
      if (map.getZoom() > 2)
        stage(
          () =>
            map.flyTo({
              zoom: INITIAL_ZOOM,
              pitch: 0,
              bearing: 0,
              duration: 1200,
            }),
          rotate,
        );
      else rotate();
    }
    return () => {
      active = false;
      detach();
      cancelFlight.current = null;
      map.stop();
    };
  }, [map, request, unavailable, stopRotation]);
  return { arrivedId, interrupt };
}
