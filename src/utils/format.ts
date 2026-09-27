export const value = (n: number | null | undefined, unit = "") =>
  n == null ? "—" : `${Math.round(n)}${unit}`;
// Preserve API local wall-clock time, independent of the browser timezone.
export const hourLabel = (time: string) => time.slice(11, 16);
export const dayLabel = (date: string) =>
  new Intl.DateTimeFormat("en", { weekday: "short", timeZone: "UTC" }).format(
    new Date(`${date}T12:00:00Z`),
  );
