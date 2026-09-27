import { SAMPLE_LOCATIONS } from "../constants/config";
import type { LocationData } from "../types/weather";
// Replace this adapter with real geocoding in a later phase.
export async function searchLocations(query: string): Promise<LocationData[]> {
  return SAMPLE_LOCATIONS.filter((item) =>
    `${item.name} ${item.country}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
}
