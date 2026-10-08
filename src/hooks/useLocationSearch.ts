import { useEffect, useState } from "react";
import { searchLocations, SEARCH_MIN_LENGTH } from "../services/locationSearch";
import type { LocationSearchResult } from "../types/weather";
interface SearchState {
  query: string;
  results: LocationSearchResult[];
  loading: boolean;
  error: string | null;
}
export function useLocationSearch(query: string) {
  const normalized = query.trim();
  const eligible = Array.from(normalized).length >= SEARCH_MIN_LENGTH;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<SearchState>({
    query: "",
    results: [],
    loading: false,
    error: null,
  });
  useEffect(() => {
    if (!eligible) {
      setState({ query: "", results: [], loading: false, error: null });
      return;
    }
    const controller = new AbortController();
    let active = true;
    setState({ query: normalized, results: [], loading: true, error: null });
    const timer = setTimeout(() => {
      void searchLocations(normalized, controller.signal).then(
        (results) => {
          if (active)
            setState({
              query: normalized,
              results,
              loading: false,
              error: null,
            });
        },
        (error) => {
          if (active)
            setState({
              query: normalized,
              results: [],
              loading: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Unable to search locations. Please try again.",
            });
        },
      );
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [normalized, eligible, attempt]);
  // Never render results belonging to the previous input, even before effect cleanup.
  const current = eligible && state.query === normalized;
  return {
    results: current ? state.results : [],
    loading: eligible && (!current || state.loading),
    error: current ? state.error : null,
    retry: () => setAttempt((value) => value + 1),
  };
}
