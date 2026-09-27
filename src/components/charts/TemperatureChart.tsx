import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { HourlyWeather } from "../../types/weather";
import { hourLabel } from "../../utils/format";
export default function TemperatureChart({
  hours,
}: {
  hours: HourlyWeather[];
}) {
  return (
    <section className="forecast-section">
      <h3>
        Temperature trend <span>°C</span>
      </h3>
      <div
        className="temperature-chart"
        role="img"
        aria-label="Temperature over the next 24 hours; values also shown in hourly forecast"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={hours}
            margin={{ top: 10, right: 12, bottom: 0, left: -22 }}
          >
            <CartesianGrid vertical={false} stroke="#ffffff0c" />
            <XAxis
              dataKey="time"
              tickFormatter={hourLabel}
              minTickGap={45}
              tick={{ fill: "#8695aa", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "#8695aa", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(label) =>
                typeof label === "string" ? hourLabel(label) : String(label)
              }
              contentStyle={{
                background: "#111c2d",
                border: "1px solid #29415a",
                borderRadius: 12,
              }}
              formatter={(value) => [`${value} °C`, "Temperature"]}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#6dd5f5"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
