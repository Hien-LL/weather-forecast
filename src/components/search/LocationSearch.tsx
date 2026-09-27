import { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";
import { searchLocations } from "../../services/locationSearch";
import type { LocationData } from "../../types/weather";
export default function LocationSearch({
  onSelect,
}: {
  onSelect: (location: LocationData) => void;
}) {
  const [query, setQuery] = useState(""),
    [open, setOpen] = useState(false);
  const [results, setResults] = useState<LocationData[]>([]);
  useEffect(() => {
    let active = true;
    void searchLocations(query).then((items) => {
      if (active) setResults(items);
    });
    return () => {
      active = false;
    };
  }, [query]);
  return (
    <div
      className="search"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <Search size={18} />
      <input
        id="location-search"
        aria-label="Search city"
        aria-expanded={open}
        aria-controls="city-results"
        placeholder="Search city..."
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
      />
      {open && (
        <div id="city-results" className="search-results">
          <small>SAMPLE CITIES</small>
          {results.length === 0 && (
            <p>No matching sample cities. Try the globe.</p>
          )}
          {results.map((location) => (
            <button
              key={location.name}
              onClick={() => {
                onSelect(location);
                setQuery(location.name);
                setOpen(false);
              }}
            >
              <MapPin size={16} />
              <span>
                {location.name}
                <small>{location.country}</small>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
