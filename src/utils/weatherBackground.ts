import { getWeatherPresentation } from "./weatherCode";
export type WeatherBackgroundKind =
  | "clear-day"
  | "clear-night"
  | "cloudy"
  | "rain"
  | "thunderstorm"
  | "snow"
  | "fog";
const images = import.meta.glob<string>("../assets/weather/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});
const gradients: Record<WeatherBackgroundKind, string> = {
  "clear-day": "linear-gradient(160deg, #355e81, #172e48 65%, #07101d)",
  "clear-night": "linear-gradient(160deg, #1d2844, #111b31 65%, #050c18)",
  cloudy: "linear-gradient(160deg, #586877, #273747 65%, #09131e)",
  rain: "linear-gradient(160deg, #3c586b, #203b4a 65%, #07131e)",
  thunderstorm: "linear-gradient(160deg, #41465c, #222c42 65%, #080e1d)",
  snow: "linear-gradient(160deg, #738590, #405869 65%, #142536)",
  fog: "linear-gradient(160deg, #6b7a7b, #3d5154 65%, #14272e)",
};
export function getWeatherBackgroundKind(
  code: number | null,
  isDay: boolean | null,
): WeatherBackgroundKind {
  const { label } = getWeatherPresentation(code);
  switch (label) {
    case "Clear Sky":
      return isDay === null ? "cloudy" : isDay ? "clear-day" : "clear-night";
    case "Rain":
    case "Heavy Rain":
      return "rain";
    case "Thunderstorm":
      return "thunderstorm";
    case "Snow":
      return "snow";
    case "Fog":
      return "fog";
    default:
      return "cloudy";
  }
}
export function getWeatherBackground(
  code: number | null,
  isDay: boolean | null,
) {
  const kind = getWeatherBackgroundKind(code, isDay);
  return {
    kind,
    src: images[`../assets/weather/${kind}.png`] ?? null,
    fallback: gradients[kind],
  };
}
