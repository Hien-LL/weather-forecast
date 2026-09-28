import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getWeatherBackground } from "../../utils/weatherBackground";
type Background = ReturnType<typeof getWeatherBackground>;
export default function WeatherBackground({
  background,
}: {
  background: Background;
}) {
  const [loaded, setLoaded] = useState<Background | null>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    let active = true;
    if (!background.src) {
      setLoaded(null);
      return;
    }
    const image = new Image();
    image.onload = () => {
      if (active) setLoaded(background);
    };
    image.onerror = () => {
      if (active) setLoaded(null);
    };
    image.src = background.src;
    return () => {
      active = false;
      image.onload = null;
      image.onerror = null;
    };
  }, [background.kind, background.src, background.fallback]);
  return (
    <div
      className="weather-backdrop"
      aria-hidden="true"
      style={{ background: background.fallback }}
      data-weather-background={background.kind}
    >
      <AnimatePresence initial={false}>
        {loaded?.src && (
          <motion.img
            key={loaded.src}
            src={loaded.src}
            alt=""
            draggable={false}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.8 }}
            onError={() => setLoaded(null)}
          />
        )}
      </AnimatePresence>
      <div className="weather-photo-shade" />
    </div>
  );
}
