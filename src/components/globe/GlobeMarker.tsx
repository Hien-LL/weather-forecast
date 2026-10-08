import { useEffect, useRef } from "react";
import { Marker, Popup, type Map } from "mapbox-gl";
import type { LocationData } from "../../types/weather";
import { coordinateLabel } from "../../services/geocodingApi";
export default function GlobeMarker({
  map,
  location,
  visible = true,
}: {
  map: Map;
  location: LocationData;
  visible?: boolean;
}) {
  const instance = useRef<{
    marker: Marker;
    popup: Popup;
    element: HTMLButtonElement;
    title: HTMLElement;
    coords: HTMLElement;
  } | null>(null);
  useEffect(() => {
    const element = document.createElement("button");
    element.className = "globe-marker";
    element.style.visibility = "hidden";
    const content = document.createElement("div");
    const title = document.createElement("strong"),
      coords = document.createElement("p");
    content.append(title, coords);
    const popup = new Popup({
      offset: 18,
      closeButton: false,
      closeOnClick: false,
    }).setDOMContent(content);
    const marker = new Marker({ element })
      .setLngLat([0, 0])
      .setPopup(popup)
      .addTo(map);
    instance.current = { marker, popup, element, title, coords };
    return () => {
      popup.remove();
      marker.remove();
      instance.current = null;
    };
  }, [map]);
  useEffect(() => {
    const current = instance.current;
    if (!current) return;
    current.element.setAttribute("aria-label", `Weather at ${location.name}`);
    current.title.textContent = location.name;
    current.coords.textContent = coordinateLabel(location);
    current.marker.setLngLat([location.longitude, location.latitude]);
    current.element.style.visibility = visible ? "visible" : "hidden";
    if (visible && !current.popup.isOpen()) current.marker.togglePopup();
    else if (!visible) current.popup.remove();
  }, [map, location.latitude, location.longitude, location.name, visible]);
  return null;
}
