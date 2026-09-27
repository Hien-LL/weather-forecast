import {
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Cloud,
  Umbrella,
} from "lucide-react";
import type { CurrentWeather } from "../../types/weather";
import { value } from "../../utils/format";
export default function WeatherDetails({
  current,
  rain,
}: {
  current: CurrentWeather;
  rain: number | null;
}) {
  const items = [
    {
      label: "Humidity",
      measurement: value(current.humidity, "%"),
      Icon: Droplets,
    },
    {
      label: "Wind",
      measurement: value(current.windSpeed, " km/h"),
      Icon: Wind,
    },
    {
      label: "Pressure",
      measurement: value(current.pressure, " hPa"),
      Icon: Gauge,
    },
    { label: "Rain chance", measurement: value(rain, "%"), Icon: Umbrella },
    {
      label: "Cloud cover",
      measurement: value(current.cloudCover, "%"),
      Icon: Cloud,
    },
    {
      label: "Precipitation",
      measurement:
        current.precipitation === null ? "—" : `${current.precipitation} mm`,
      Icon: CloudRain,
    },
  ];
  return (
    <div className="details-grid">
      {items.map(({ label, measurement, Icon }) => (
        <div className="detail" key={label}>
          <Icon size={16} />
          <span>{label}</span>
          <strong>{measurement}</strong>
        </div>
      ))}
    </div>
  );
}
