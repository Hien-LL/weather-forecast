import { useEffect, useState } from "react";
import { fetchWeather } from "../services/weatherApi";
import type { WeatherData } from "../types/weather";
interface State {
  key: string;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
}
export function useWeather(latitude?: number, longitude?: number) {
  const [attempt, setAttempt] = useState(0);
  const key = `${latitude}:${longitude}:${attempt}`;
  const [state, setState] = useState<State>({
    key: "",
    weather: null,
    loading: false,
    error: null,
  });
  const selected = latitude !== undefined && longitude !== undefined;
  useEffect(() => {
    if (latitude === undefined || longitude === undefined) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    let active = true;
    setState({ key, weather: null, loading: true, error: null });
    fetchWeather({ latitude, longitude }, controller.signal)
      .then((weather) => {
        if (active) setState({ key, weather, loading: false, error: null });
      })
      .catch(() => {
        if (active)
          setState({
            key,
            weather: null,
            loading: false,
            error: "Unable to load weather data. Please try again.",
          });
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [latitude, longitude, key]);
  const visible =
    selected && state.key === key
      ? state
      : { weather: null, loading: selected, error: null };
  return { ...visible, retry: () => setAttempt((previous) => previous + 1) };
}
