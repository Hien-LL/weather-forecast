import { CloudRain, Cloud } from "lucide-react";
import type { WeatherData } from "../../types/weather";
import { summarizeRain } from "../../utils/rainForecast";
import { hourLabel, value } from "../../utils/format";
export default function RainForecastCard({
  weather,
}: {
  weather: WeatherData;
}) {
  const rain = summarizeRain(weather);
  const Icon = rain.isRainingNow ? CloudRain : Cloud;
  const when = (time: string) =>
    `${time.slice(0, 10) !== weather.current.time.slice(0, 10) ? "tomorrow " : ""}${hourLabel(time)}`;
  return (
    <section
      className={`rain-card ${rain.isRainingNow ? "rain-active" : ""}`}
      aria-labelledby="rain-title"
    >
      <div className="rain-heading">
        <Icon size={22} />
        <span className="eyebrow">RAIN OUTLOOK</span>
      </div>
      <h3 id="rain-title">
        {rain.isRainingNow
          ? "Raining now"
          : rain.currentKnown
            ? "No rain right now"
            : "Current rain data unavailable"}
      </h3>
      <p>
        {rain.currentRainMm === null
          ? "Current amount unavailable"
          : `${Number(rain.currentRainMm.toFixed(2))} mm in the current interval`}{" "}
        <span>/ Model estimate</span>
      </p>
      <div className="rain-probabilities">
        <div>
          <small>Next hour</small>
          <strong>{value(rain.nextHourProbability, "%")}</strong>
        </div>
        <div>
          <small>Next 3h peak</small>
          <strong>{value(rain.maxProbabilityNext3Hours, "%")}</strong>
        </div>
        <div>
          <small>Next 6h peak</small>
          <strong>{value(rain.maxProbabilityNext6Hours, "%")}</strong>
        </div>
      </div>
      <p className="rain-outlook">
        {rain.nextLikelyRainTime
          ? `${rain.isRainingNow ? "Rain may continue" : "Rain may begin"} around ${when(rain.nextLikelyRainTime)} (${value(rain.nextLikelyRainProbability, "%")} chance).`
          : rain.completeNext12Hours
            ? "No significant rain expected in the next 12 hours."
            : "Not enough forecast data for a 12-hour rain outlook."}
      </p>
      {rain.highestChanceTime && (
        <small>
          Highest precipitation chance: {when(rain.highestChanceTime)} /{" "}
          {value(rain.highestChanceProbability, "%")}
        </small>
      )}
      <small>
        Hourly probabilities from Open-Meteo; not a guaranteed start time. Times
        are local to this location.
      </small>
    </section>
  );
}
