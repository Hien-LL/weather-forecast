import { useEffect, useRef, useState } from "react";
import { Search, MapPin, X, LoaderCircle } from "lucide-react";
import { useLocationSearch } from "../../hooks/useLocationSearch";
import { SEARCH_MIN_LENGTH } from "../../services/locationSearch";
import type { LocationSearchResult } from "../../types/weather";
export default function LocationSearch({
  onSelect,
}: {
  onSelect: (location: LocationSearchResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [composing, setComposing] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const { results, loading, error, retry } = useLocationSearch(
    composing ? "" : searchQuery,
  );
  const expanded =
    open &&
    !composing &&
    Array.from(searchQuery.trim()).length >= SEARCH_MIN_LENGTH;
  const highlighted =
    !loading && !error && activeIndex >= 0 ? results[activeIndex] : undefined;
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    if (expanded && highlighted)
      document
        .getElementById(`city-result-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, expanded, highlighted]);
  const select = (location: LocationSearchResult) => {
    setOpen(false);
    setQuery(location.name);
    setSearchQuery("");
    setActiveIndex(-1);
    onSelect(location);
  };
  return (
    <div
      className="search"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Search size={18} aria-hidden="true" />
      <input
        ref={input}
        id="location-search"
        role="combobox"
        aria-label="Search city"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={expanded ? "city-results" : undefined}
        aria-activedescendant={
          expanded && highlighted ? `city-result-${activeIndex}` : undefined
        }
        autoComplete="off"
        placeholder="Search city..."
        value={query}
        onFocus={() => setOpen(true)}
        onCompositionStart={() => setComposing(true)}
        onCompositionEnd={() => setComposing(false)}
        onChange={(event) => {
          setQuery(event.target.value);
          setSearchQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onKeyDown={(event) => {
          if (event.nativeEvent.isComposing || composing) return;
          if (event.key === "Escape") {
            event.preventDefault();
            setOpen(false);
            setActiveIndex(-1);
          } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
            if (results.length)
              setActiveIndex((index) =>
                event.key === "ArrowDown"
                  ? (index + 1) % results.length
                  : index <= 0
                    ? results.length - 1
                    : index - 1,
              );
          } else if (event.key === "Enter" && expanded && highlighted) {
            event.preventDefault();
            select(highlighted);
          }
        }}
      />
      {loading && (
        <LoaderCircle
          size={16}
          className="search-spinner"
          aria-label="Searching locations"
        />
      )}
      {query && (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          onClick={() => {
            setQuery("");
            setSearchQuery("");
            setOpen(false);
            setActiveIndex(-1);
            input.current?.focus();
          }}
        >
          <X size={16} strokeWidth={1.5} />
        </button>
      )}
      {expanded && (
        <div className="search-results">
          <div role="status" aria-live="polite" className="search-status">
            {loading
              ? "Searching locations..."
              : (error ??
                (results.length
                  ? `${results.length} locations found.`
                  : "No locations found."))}
          </div>
          {error && (
            <button type="button" onClick={retry} className="search-retry">
              Try again
            </button>
          )}
          <ul id="city-results" role="listbox" aria-label="Locations">
            {results.map((location, index) => (
              <li
                key={location.id}
                id={`city-result-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onPointerMove={() => setActiveIndex(index)}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(location)}
              >
                <MapPin size={16} aria-hidden="true" />
                <span>
                  {location.name}
                  <small>{location.contextLabel}</small>
                </span>
              </li>
            ))}
          </ul>
          <a
            className="search-attribution"
            href="https://www.mapbox.com/about/maps/"
            target="_blank"
            rel="noreferrer"
          >
            Search by Mapbox
          </a>
        </div>
      )}
    </div>
  );
}
