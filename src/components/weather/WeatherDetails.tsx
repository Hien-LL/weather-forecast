import {
  Droplets,
  Wind,
  Gauge,
  CloudRain,
  Cloud,
  Umbrella,
  ThermometerSun,
  ThermometerSnowflake,
} from "lucide-react";
import type { CurrentWeather, DailyWeather } from "../../types/weather";
import { value } from "../../utils/format";
export default function WeatherDetails({
  current,
  rain,
  today,
}: {
  current: CurrentWeather;
  rain: number | null;
  today?: DailyWeather;
}) {
  const items = [
    {
      label: "High today",
      measurement: value(today?.maxTemperature, "°C"),
      Icon: ThermometerSun,
    },
    {
      label: "Low today",
      measurement: value(today?.minTemperature, "°C"),
      Icon: ThermometerSnowflake,
    },
    {
      label: "Humidity",
      measurement: value(current.humidity, "%"),
      Icon: Droplets,
    },
    {
      label: "Cloud cover",
      measurement: value(current.cloudCover, "%"),
      Icon: Cloud,
    },
    {
      label: "Wind",
      measurement: value(current.windSpeed, " km/h"),
      Icon: Wind,
    },
    { label: "Rain chance", measurement: value(rain, "%"), Icon: Umbrella },
    {
      label: "Pressure",
      measurement: value(current.pressure, " hPa"),
      Icon: Gauge,
    },
    {
      label: "Precipitation",
      measurement:
        current.precipitation === null ? "—" : `${current.precipitation} mm`,
      Icon: CloudRain,
    },
  ];
  return (
    <section className="weather-metrics" aria-labelledby="conditions-title">
      <h3 id="conditions-title">Today's conditions</h3>
      <dl>
        {items.map(({ label, measurement, Icon }) => (
          <div className="metric-row" key={label}>
            <dt>
              <Icon size={17} strokeWidth={1.3} />
              {label}
            </dt>
            <dd>{measurement}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
