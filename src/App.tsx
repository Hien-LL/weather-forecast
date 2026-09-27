import { useCallback, useRef, useState } from "react";
import { MotionConfig } from "framer-motion";
import Header from "./components/common/Header";
import WeatherGlobe from "./components/globe/WeatherGlobe";
import WeatherPanel from "./components/weather/WeatherPanel";
import LocationOnboarding from "./components/onboarding/LocationOnboarding";
import { useWeather } from "./hooks/useWeather";
import { useGeolocation } from "./hooks/useGeolocation";
import { useLocationInfo } from "./hooks/useLocationInfo";
import { coordinateLabel } from "./services/geocodingApi";
import type {
  CameraMode,
  CameraRequest,
  Coordinates,
  LocationData,
} from "./types/weather";
interface Selection {
  location: LocationData;
  camera: CameraRequest;
  settled: boolean;
}
export default function App() {
  const [view, setView] = useState<"welcome" | "exploring">("welcome");
  const [selection, setSelection] = useState<Selection | null>(null);
  const sequence = useRef(0);
  const gps = useGeolocation();
  const location = useLocationInfo(selection?.location ?? null);
  const { weather, loading, error, retry } = useWeather(
    location?.latitude,
    location?.longitude,
  );
  const choose = useCallback(
    (coordinates: Coordinates, mode: CameraMode, city?: LocationData) => {
      gps.cancel();
      setView("exploring");
      setSelection({
        location: city ?? {
          ...coordinates,
          name: coordinateLabel(coordinates),
        },
        camera: { id: ++sequence.current, coordinates, mode },
        settled: false,
      });
    },
    [gps.cancel],
  );
  const onSelect = useCallback(
    (latitude: number, longitude: number) =>
      choose({ latitude, longitude }, "manual"),
    [choose],
  );
  const onSettled = useCallback(
    (id: number) =>
      setSelection((previous) =>
        previous?.camera.id === id ? { ...previous, settled: true } : previous,
      ),
    [],
  );
  const locate = async () => {
    setView("welcome");
    const coordinates = await gps.request();
    if (coordinates) choose(coordinates, "gps");
  };
  const explore = () => {
    gps.cancel();
    setView("exploring");
  };
  const search = () => {
    explore();
    requestAnimationFrame(() =>
      document.querySelector<HTMLInputElement>("#location-search")?.focus(),
    );
  };
  const panelReady = !!selection?.settled && (!!weather || !!error) && !loading;
  const phase =
    view === "welcome"
      ? gps.status === "requesting"
        ? "locating"
        : "welcome"
      : selection
        ? !selection.settled
          ? "flying"
          : panelReady
            ? "weather"
            : "loading"
        : "exploring";
  return (
    <MotionConfig reducedMotion="user">
      <div className="app-shell" data-phase={phase}>
        <Header
          onSelect={(city) => choose(city, "search", city)}
          onLocate={() => void locate()}
        />
        <main className={`dashboard ${selection ? "" : "earth-only"}`}>
          <WeatherGlobe
            selected={location}
            cameraRequest={selection?.camera ?? null}
            onLocationSelect={onSelect}
            onCameraSettled={onSettled}
          />
          {panelReady ? (
            <WeatherPanel
              key={selection?.camera.id}
              location={location}
              weather={weather}
              loading={loading}
              error={error}
              retry={retry}
            />
          ) : selection ? (
            <div className="journey-status glass" role="status">
              <span className="status-dot" />
              <h2>
                {selection.settled
                  ? "Reading the atmosphere..."
                  : "Travelling to your forecast..."}
              </h2>
              <p>{location?.name}</p>
              <small>
                You can still move the globe or choose another location.
              </small>
            </div>
          ) : null}
        </main>
        {view === "welcome" && (
          <LocationOnboarding
            status={gps.status}
            onLocate={() => void locate()}
            onExplore={explore}
            onSearch={search}
          />
        )}
        <footer className="app-footer">
          <span>WEATHERFORECAST / EXPLORE YOUR ATMOSPHERE</span>
          <span>
            Forecasts by <a href="https://open-meteo.com/">Open-Meteo</a>
          </span>
        </footer>
      </div>
    </MotionConfig>
  );
}
