import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Orbit } from "lucide-react";
import type { LocationData, WeatherData } from "../../types/weather";
import { getWeatherBackground } from "../../utils/weatherBackground";
import WeatherBackground from "./WeatherBackground";
import RainForecastCard from "./RainForecastCard";
import CurrentWeather from "./CurrentWeather";
import WeatherDetails from "./WeatherDetails";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import TemperatureChart from "../charts/TemperatureChart";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
import "@fontsource-variable/manrope";
import "./weather-panel.css";
interface Props {
  location: LocationData | null;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
  ready?: boolean;
}
export default function WeatherPanel({
  location,
  weather,
  loading,
  error,
  retry,
  ready = true,
}: Props) {
  const [previousBackground, setPreviousBackground] = useState(() =>
    getWeatherBackground(null, null),
  );
  const background =
    ready && weather
      ? getWeatherBackground(weather.current.weatherCode, weather.current.isDay)
      : previousBackground;
  useEffect(() => {
    if (ready && weather)
      setPreviousBackground(
        getWeatherBackground(
          weather.current.weatherCode,
          weather.current.isDay,
        ),
      );
  }, [ready, weather]);
  return (
    <motion.aside
      className="weather-panel weather-immersive"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      aria-label="Weather forecast"
      aria-busy={loading || !ready}
    >
      <WeatherBackground background={background} />
      {!location ? (
        <div className="panel-state">
          <Orbit size={36} strokeWidth={1.2} />
          <h2>Your next forecast awaits</h2>
          <p>Click anywhere on the globe to explore the weather.</p>
        </div>
      ) : !ready || loading ? (
        <div className="panel-state" role="status">
          <LoadingSpinner />
          <p>Preparing the view for {location.name}.</p>
        </div>
      ) : error ? (
        <div className="panel-state">
          <ErrorMessage message={error} retry={retry} />
        </div>
      ) : weather ? (
        <>
          <CurrentWeather
            current={weather.current}
            location={location}
            timezone={weather.timezone}
          />
          <div
            className="weather-lower"
            role="region"
            aria-label="Weather details and forecasts"
            tabIndex={0}
          >
            <RainForecastCard weather={weather} />
            <WeatherDetails
              current={weather.current}
              rain={weather.hourly[0]?.precipitationProbability ?? null}
              today={weather.daily[0]}
            />
            <HourlyForecast hours={weather.hourly} />
            <TemperatureChart hours={weather.hourly} />
            <DailyForecast days={weather.daily} />
            <footer className="panel-footer">
              Forecast data by{" "}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
              >
                Open-Meteo
              </a>
              <span>Local time at location</span>
            </footer>
          </div>
        </>
      ) : (
        <div className="panel-state">
          <p>Waiting for weather data.</p>
        </div>
      )}
    </motion.aside>
  );
}
