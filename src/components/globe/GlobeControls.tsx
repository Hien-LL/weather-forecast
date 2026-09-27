import { Plus, Minus, Globe2 } from "lucide-react";
import type { Map } from "mapbox-gl";
import { INITIAL_CENTER, INITIAL_ZOOM } from "../../constants/config";
export default function GlobeControls({
  map,
  onInteract,
}: {
  map: Map;
  onInteract: () => void;
}) {
  return (
    <div className="globe-controls glass">
      <button
        aria-label="Zoom in"
        onClick={() => {
          onInteract();
          map.zoomIn();
        }}
      >
        <Plus size={18} />
      </button>
      <button
        aria-label="Zoom out"
        onClick={() => {
          onInteract();
          map.zoomOut();
        }}
      >
        <Minus size={18} />
      </button>
      <button
        aria-label="Reset globe view"
        onClick={() => {
          onInteract();
          map.flyTo({
            center: INITIAL_CENTER,
            zoom: INITIAL_ZOOM,
            pitch: 0,
            bearing: 0,
          });
        }}
      >
        <Globe2 size={18} />
      </button>
    </div>
  );
}
