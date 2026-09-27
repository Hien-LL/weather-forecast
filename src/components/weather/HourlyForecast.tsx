import { motion } from "framer-motion";
import type { HourlyWeather } from "../../types/weather";
import { getWeatherPresentation } from "../../utils/weatherCode";
import { hourLabel, value } from "../../utils/format";
export default function HourlyForecast({ hours }: { hours: HourlyWeather[] }) {
  return (
    <section className="forecast-section">
      <h3>
        Hourly forecast <span>Next 24 hours</span>
      </h3>
      <div
        className="hourly-scroll"
        tabIndex={0}
        aria-label="Hourly forecast; scroll for more hours"
      >
        {hours.map((hour, index) => {
          const { Icon, label } = getWeatherPresentation(hour.weatherCode);
          return (
            <motion.div
              className="hour-card"
              key={hour.time}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: Math.min(index, 5) * 0.04 }}
            >
              <time dateTime={hour.time}>{hourLabel(hour.time)}</time>
              <Icon size={23} aria-label={label} />
              <strong>{value(hour.temperature, "°")}</strong>
              <small>{value(hour.precipitationProbability, "%")}</small>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
