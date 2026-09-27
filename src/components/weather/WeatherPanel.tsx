import { motion } from "framer-motion";
import { Orbit, ArrowUpRight } from "lucide-react";
import type { LocationData, WeatherData } from "../../types/weather";
import RainForecastCard from "./RainForecastCard";
import CurrentWeather from "./CurrentWeather";
import WeatherDetails from "./WeatherDetails";
import HourlyForecast from "./HourlyForecast";
import DailyForecast from "./DailyForecast";
import TemperatureChart from "../charts/TemperatureChart";
import LoadingSpinner from "../common/LoadingSpinner";
import ErrorMessage from "../common/ErrorMessage";
interface Props {
  location: LocationData | null;
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}
export default function WeatherPanel({
  location,
  weather,
  loading,
  error,
  retry,
}: Props) {
  return (
    <motion.aside
      className="weather-panel glass"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35 }}
      aria-label="Weather forecast"
      aria-busy={loading}
    >
      <div className="panel-label">
        <span className="eyebrow">WEATHER INTELLIGENCE</span>
        <ArrowUpRight size={16} />
      </div>
      {!location ? (
        <div className="state-card empty-state">
          <div className="empty-orbit">
            <Orbit size={48} strokeWidth={1} />
          </div>
          <span className="eyebrow">DISCOVER YOUR FORECAST</span>
          <h2>
            Every place has
            <br />a story in the sky.
          </h2>
          <p>Click anywhere on the globe to explore the weather.</p>
          <div className="empty-features">
            <span>24-hour outlook</span>
            <span>7-day forecast</span>
          </div>
        </div>
      ) : loading ? (
        <LoadingSpinner />
      ) : error ? (
        <ErrorMessage message={error} retry={retry} />
      ) : weather ? (
        <div key={`${location.latitude}:${location.longitude}`}>
          <CurrentWeather
            current={weather.current}
            location={location}
            timezone={weather.timezone}
          />
          <RainForecastCard weather={weather} />
          <WeatherDetails
            current={weather.current}
            rain={weather.hourly[0]?.precipitationProbability ?? null}
          />
          <HourlyForecast hours={weather.hourly} />
          <TemperatureChart hours={weather.hourly} />
          <DailyForecast days={weather.daily} />
        </div>
      ) : null}
      <footer className="panel-footer">
        Forecast data by{" "}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
        <span>Local time at location</span>
      </footer>
    </motion.aside>
  );
}
