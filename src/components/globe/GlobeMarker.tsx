import { useEffect } from "react";
import { Marker, Popup, type Map } from "mapbox-gl";
import type { LocationData } from "../../types/weather";
import { coordinateLabel } from "../../services/geocodingApi";
export default function GlobeMarker({
  map,
  location,
}: {
  map: Map;
  location: LocationData;
}) {
  useEffect(() => {
    const element = document.createElement("button");
    element.className = "globe-marker";
    element.setAttribute("aria-label", `Weather at ${location.name}`);
    const content = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = location.name;
    const coords = document.createElement("p");
    coords.textContent = coordinateLabel(location);
    content.append(title, coords);
    const popup = new Popup({
      offset: 18,
      closeButton: false,
      closeOnClick: false,
    }).setDOMContent(content);
    const marker = new Marker({ element })
      .setLngLat([location.longitude, location.latitude])
      .setPopup(popup)
      .addTo(map);
    marker.togglePopup();
    return () => {
      popup.remove();
      marker.remove();
    };
  }, [map, location.latitude, location.longitude, location.name]);
  return null;
}
