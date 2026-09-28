import { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { Globe2, MousePointer2 } from "lucide-react";
import {
  INITIAL_CENTER,
  INITIAL_ZOOM,
  MAPBOX_TOKEN,
  MAPBOX_TOKEN_ERROR,
} from "../../constants/config";
import type { CameraRequest, LocationData } from "../../types/weather";
import { coordinateLabel } from "../../services/geocodingApi";
import { useGlobeCamera } from "../../hooks/useGlobeCamera";
import GlobeControls from "./GlobeControls";
import GlobeMarker from "./GlobeMarker";
interface Props {
  selected: LocationData | null;
  cameraRequest: CameraRequest | null;
  onLocationSelect: (latitude: number, longitude: number) => void;
  onCameraSettled: (id: number) => void;
}
export default function WeatherGlobe({
  selected,
  cameraRequest,
  onLocationSelect,
  onCameraSettled,
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onLocationSelect);
  const frame = useRef<number | null>(null);
  const rotationStopped = useRef(false);
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(MAPBOX_TOKEN_ERROR);
  const [ready, setReady] = useState(false);
  const stopRotation = useCallback(() => {
    rotationStopped.current = true;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
  }, []);
  const { arrivedId, interrupt } = useGlobeCamera(
    map,
    cameraRequest,
    !!error,
    onCameraSettled,
    stopRotation,
  );
  useEffect(() => {
    callback.current = onLocationSelect;
  }, [onLocationSelect]);
  useEffect(() => {
    if (!container.current || MAPBOX_TOKEN_ERROR) return;
    let instance: mapboxgl.Map;
    let disposed = false;
    let loaded = false;
    try {
      instance = new mapboxgl.Map({
        container: container.current,
        accessToken: MAPBOX_TOKEN,
        style: "mapbox://styles/mapbox/standard-satellite",
        projection: "globe",
        center: INITIAL_CENTER,
        zoom: INITIAL_ZOOM,
        pitch: 0,
        bearing: 0,
        minZoom: 0,
        maxZoom: 18,
        attributionControl: true,
      });
    } catch {
      setError(
        "Unable to start the globe. Check WebGL support in your browser.",
      );
      return;
    }
    const timeout = window.setTimeout(() => {
      if (!loaded)
        setError(
          "Map loading timed out. Check your token and connection, then reload.",
        );
    }, 20000);
    instance.on("style.load", () => {
      if (disposed) return;
      loaded = true;
      window.clearTimeout(timeout);
      instance.setProjection("globe");
      instance.setFog({
        color: "rgb(30,41,51)",
        "high-color": "rgb(26,36,45)",
        "horizon-blend": 0.01,
        "space-color": "rgb(24,34,43)",
        "star-intensity": 0.06,
      });
      setMap(instance);
      setReady(true);
      setError(null);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      let last = performance.now();
      const rotate = (now: number) => {
        if (disposed || rotationStopped.current) return;
        const delta = Math.min((now - last) / 1000, 0.1);
        last = now;
        if (!instance.isMoving()) {
          const center = instance.getCenter();
          instance.jumpTo({ center: [center.lng - delta * 0.5, center.lat] });
        }
        frame.current = requestAnimationFrame(rotate);
      };
      if (
        !rotationStopped.current &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
      )
        frame.current = requestAnimationFrame(rotate);
    });
    instance.on("error", () => {
      if (!disposed)
        setError(
          "Unable to load Mapbox imagery. Check the public token, allowed URLs and connection.",
        );
    });
    instance.on("click", (event) => {
      const point = event.lngLat.wrap();
      callback.current(point.lat, point.lng);
    });
    const observer = new ResizeObserver(() => instance.resize());
    observer.observe(container.current);
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      instance.remove();
    };
  }, []);
  return (
    <section
      className="globe-section"
      aria-label="Interactive Earth globe"
      onPointerDownCapture={interrupt}
      onWheelCapture={interrupt}
      onKeyDownCapture={interrupt}
    >
      <div ref={container} className="map-container" />
      <div className="globe-heading">
        <span className="eyebrow">
          <span className="status-dot" /> PLANET EARTH / SATELLITE
        </span>
        <h1>
          A world of weather.
          <br />
          <span>Yours to explore.</span>
        </h1>
      </div>
      {error ? (
        <div className="map-fallback" role="alert">
          <Globe2 size={70} strokeWidth={0.7} />
          <h2>{error}</h2>
          <p>Add a public Mapbox token to .env.local and restart Vite.</p>
          <small>Location and city search still work without a map.</small>
        </div>
      ) : (
        !ready && (
          <p className="map-loading" role="status">
            Loading satellite Earth...
          </p>
        )
      )}
      {map && (
        <>
          <GlobeControls map={map} onInteract={interrupt} />
          {selected && cameraRequest?.id === arrivedId && (
            <GlobeMarker map={map} location={selected} />
          )}
        </>
      )}
      <div className="globe-hint glass">
        <MousePointer2 size={15} />
        <span>Drag to explore / Scroll to zoom / Click for weather</span>
      </div>
      <div className="coordinates">
        {selected ? coordinateLabel(selected) : "EARTH FROM SPACE"}
        <span>GLOBAL COVERAGE</span>
      </div>
    </section>
  );
}
