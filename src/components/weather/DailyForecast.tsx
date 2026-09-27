import type { DailyWeather } from "../../types/weather";
import { getWeatherPresentation } from "../../utils/weatherCode";
import { dayLabel, value } from "../../utils/format";
export default function DailyForecast({ days }: { days: DailyWeather[] }) {
  return (
    <section className="forecast-section">
      <h3>7-day forecast</h3>
      {days.map((day, index) => {
        const { Icon, label } = getWeatherPresentation(day.weatherCode);
        return (
          <div className="day-row" key={day.date}>
            <time dateTime={day.date}>
              {index === 0 ? "Today" : dayLabel(day.date)}
            </time>
            <Icon size={20} />
            <span className="day-description">{label}</span>
            <small>{value(day.precipitationProbability, "%")}</small>
            <strong>
              <span>{value(day.minTemperature, "°")}</span> /{" "}
              {value(day.maxTemperature, "°")}
            </strong>
          </div>
        );
      })}
    </section>
  );
}
