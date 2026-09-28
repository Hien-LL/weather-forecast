import { motion } from "framer-motion";
import { MapPin, Moon } from "lucide-react";
import type {
  CurrentWeather as Current,
  LocationData,
} from "../../types/weather";
import { getWeatherPresentation } from "../../utils/weatherCode";
import { value } from "../../utils/format";
import { coordinateLabel } from "../../services/geocodingApi";
export default function CurrentWeather({
  current,
  location,
  timezone,
}: {
  current: Current;
  location: LocationData;
  timezone: string;
}) {
  const { label, Icon } = getWeatherPresentation(current.weatherCode);
  const WeatherIcon =
    current.weatherCode === 0 && current.isDay === false ? Moon : Icon;
  const date = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${current.time.slice(0, 10)}T12:00:00Z`));
  return (
    <section className="weather-hero" aria-label="Current weather">
      <div className="hero-place">
        <MapPin size={15} strokeWidth={1.4} />
        <span>{location.country ?? coordinateLabel(location)}</span>
      </div>
      <h2>{location.name}</h2>
      <time className="hero-time" dateTime={current.time}>
        {date} <span>/</span> {current.time.slice(11, 16)}
      </time>
      <motion.div
        className="hero-reading"
        key={`${location.latitude}:${location.longitude}:${current.temperature}:${current.weatherCode}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="hero-temperature">
          <span>{value(current.temperature, "°")}</span>
          <span className="hero-unit">C</span>
        </div>
        <div className="hero-condition">
          <WeatherIcon size={25} strokeWidth={1.3} />
          <span>{label}</span>
        </div>
      </motion.div>
      <div className="hero-foot">
        <p>Feels like {value(current.apparentTemperature, "°C")}</p>
        <span>
          Updated locally <span className="hero-zone">{timezone}</span>
        </span>
      </div>
    </section>
  );
}
