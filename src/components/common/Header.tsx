import { Globe2, Settings2, Moon, LocateFixed } from "lucide-react";
import LocationSearch from "../search/LocationSearch";
import type { LocationData } from "../../types/weather";
export default function Header({
  onSelect,
  onLocate,
}: {
  onSelect: (location: LocationData) => void;
  onLocate: () => void;
}) {
  return (
    <header className="header">
      <a className="brand" href="./">
        <span className="brand-icon">
          <Globe2 />
        </span>
        <span>
          Weather<span className="brand-accent">Forecast</span>
          <small>YOUR WORLD. AT A GLANCE.</small>
        </span>
      </a>
      <LocationSearch onSelect={onSelect} />
      <div className="header-actions">
        <button
          className="my-location"
          aria-label="My Location"
          onClick={onLocate}
        >
          <LocateFixed size={18} />
          <span>My Location</span>
        </button>
        <button
          className="icon-button"
          disabled
          title="Settings coming soon"
          aria-label="Settings coming soon"
        >
          <Settings2 size={19} />
        </button>
        <button
          className="icon-button"
          disabled
          title="Theme switching coming soon"
          aria-label="Dark theme"
        >
          <Moon size={19} />
        </button>
      </div>
    </header>
  );
}
