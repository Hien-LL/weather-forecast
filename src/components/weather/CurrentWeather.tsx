import type {
  CurrentWeather as Current,
  LocationData,
} from "../../types/weather";
import { getWeatherPresentation } from "../../utils/weatherCode";
import { value } from "../../utils/format";
import { MapPin } from "lucide-react";
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
  return (
    <section>
      <div className="location-title">
        <MapPin size={17} />
        <div>
          <h2>{location.name}</h2>
          <p>
            {location.country ??
              `${location.latitude.toFixed(4)}°, ${location.longitude.toFixed(4)}°`}
          </p>
        </div>
        <span className="live-badge">CURRENT</span>
      </div>
      <p className="update-time">
        Updated {current.time.replace("T", " / ")} ({timezone})
      </p>
      <div className="current-temperature">
        <div>
          <strong>{value(current.temperature, "°")}</strong>
          <span className="unit">C</span>
          <p>{label}</p>
        </div>
        <Icon className="weather-hero-icon" size={80} strokeWidth={1.2} />
      </div>
      <p className="muted">
        Feels like {value(current.apparentTemperature, "°C")}
      </p>
    </section>
  );
}
