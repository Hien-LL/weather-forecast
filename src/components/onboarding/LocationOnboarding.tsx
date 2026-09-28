import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { LocateFixed, Search } from "lucide-react";
import {
  LOCATION_MESSAGES,
  type GeolocationStatus,
} from "../../services/geolocationService";
interface Props {
  status: GeolocationStatus;
  onLocate: () => void;
  onExplore: () => void;
  onSearch: () => void;
}
export default function LocationOnboarding({
  status,
  onLocate,
  onExplore,
  onSearch,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    const previous = document.activeElement;
    node?.showModal();
    return () => {
      node?.close();
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="onboarding-dialog"
      aria-labelledby="welcome-title"
      aria-describedby="location-message"
      onCancel={(event) => {
        event.preventDefault();
        onExplore();
      }}
    >
      <motion.div
        className="onboarding-card glass"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <LocateFixed size={30} className="onboarding-icon" />
        <span className="eyebrow">WELCOME TO WEATHERFORECAST</span>
        <h2 id="welcome-title">
          Discover weather anywhere
          <br />
          on planet Earth.
        </h2>
        <p id="location-message" role="status" aria-live="polite">
          {LOCATION_MESSAGES[status]}
        </p>
        <button
          autoFocus
          className="primary-button"
          aria-label="Use my location"
          disabled={status === "requesting"}
          onClick={onLocate}
        >
          {status === "requesting" ? "Locating you..." : "Use My Location"}
        </button>
        <button
          className="secondary-button"
          aria-label="Explore Earth manually"
          onClick={onExplore}
        >
          Explore Manually
        </button>
        <button
          className="search-link"
          aria-label="Search for a city"
          onClick={onSearch}
        >
          <Search size={14} /> Search city
        </button>
        <small>Your location is only used to display local weather.</small>
        <small>
          Coordinates are sent to Mapbox for place names and Open-Meteo for
          weather. Location accuracy can vary.
        </small>
      </motion.div>
    </dialog>
  );
}
