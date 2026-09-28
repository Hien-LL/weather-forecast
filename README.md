# WeatherForecast

Satellite Earth explorer with opt-in location, cinematic camera movement and an Open-Meteo rain outlook. This extends the existing React + TypeScript application; no backend, accounts, database or machine-learning model.

## Features and user flows

- Startup: Standard Satellite imagery rendered directly by Mapbox GL JS 3.31, globe projection, zoom 1.4, zero pitch/bearing, atmosphere and space background. The whole globe area is available before selecting a location. Auto-rotation is 0.5 degrees/second and stops permanently on a user gesture or camera request. Reduced-motion users get no auto-rotation and immediate camera positioning.
- **Use My Location**: only this button (or the later My Location button) invokes the browser geolocation API. Options: high accuracy, 10-second timeout, cached positions up to five minutes. Location accuracy depends on the device/browser.
- GPS states: idle, requesting, success, denied, unavailable, timeout, unsupported. Errors stay in the accessible native-dialog onboarding with retry, Explore Manually and Search city actions. Escape explores manually. Late GPS results are ignored after cancellation or another selection.
- GPS/search: coordinates immediately start the existing weather hook and independent reverse geocoding. Camera first pulls back if necessary, rotates to the destination at globe scale, then flies to zoom 9. GPS rotate/zoom durations are 1.6/3 seconds; sample-city search uses 0.9/2 seconds. Mapbox moveend events chain the stages, not arbitrary timers.
- Marker appears after the camera sequence. The weather panel fades/slides in once the sequence settles and data or an error is available. User camera interaction interrupts the cinematic and releases the waiting UI; the selected location remains selected. A missing/failed map cannot block weather.
- Manual exploration: no GPS prompt. Clicking Earth reverse geocodes coordinates, uses a short 650 ms camera adjustment and loads weather. Sample city search remains explicitly labeled.
- Marker has a subtle pulse and a safe text-only location popup. Reverse-geocoding results can update its label without replaying the flight.
- Current conditions, 24 hourly entries, seven daily forecasts and a responsive temperature chart. Settings/theme remain UI placeholders.

## Why Earth could not load in the inspected setup

The previous component already used globe projection, imported Mapbox CSS, and had a nonzero container height. However, `.env.local` contained a placeholder rather than a public `pk.` Mapbox token, so satellite imagery could not load. The former style was satellite-streets-v12, and the startup shared space with an empty panel. This update validates the token format, switches to standard-satellite, reasserts globe projection on style load, and uses a full-width Earth startup. A real token is still required; no fabricated Earth model replaces Mapbox.

## Tech stack

React, React DOM, TypeScript strict, Vite, Tailwind CSS, Mapbox GL JS, Framer Motion, Recharts and Lucide React. Vitest for data/service unit tests. No new runtime package is needed for this update.

## Project structure

- `src/components/globe`: Mapbox lifecycle, globe controls and marker popup.
- `src/components/onboarding/LocationOnboarding.tsx`: keyboard-accessible permission onboarding.
- `src/components/weather`: current/hourly/daily presentation and RainForecastCard.
- `src/components/charts`, `search`, `common`: chart, sample search, header and status UI.
- `src/hooks/useGlobeCamera.ts`: event-driven camera sequencing and cancellation.
- `src/hooks/useGeolocation.ts`: explicit requests, status and stale-result protection.
- `src/hooks/useLocationInfo.ts`: independent reverse-geocoding lifecycle.
- `src/hooks/useWeather.ts`: existing weather request lifecycle, 15-second timeout and retry.
- `src/services/geolocationService.ts`: browser API and typed error mapping.
- `src/services/geocodingApi.ts`: Mapbox Geocoding v6 reverse adapter, validation and coordinate fallback.
- `src/services/weatherApi.ts`: Open-Meteo HTTP request and runtime response validation.
- `src/utils/rainForecast.ts`: pure rain analysis, tested separately from UI.
- `src/utils/weatherCode.ts`: shared WMO classification, including rain and snow.
- `src/types/weather.ts`, `src/constants/config.ts`: domain types and configuration.
- `src/App.tsx`: selected location, camera request IDs and startup/panel orchestration.

## Installation and environment variables

Use Node.js 22.12+ or Node.js 24 LTS.

```powershell
cd D:\bot\weather-forecast
npm install
# Only create this file if it does not already exist:
Copy-Item .env.example .env.local
```

Edit `.env.local` and replace the placeholder:

```dotenv
VITE_MAPBOX_ACCESS_TOKEN=pk.your_actual_public_mapbox_token
```

A public browser token must be able to access Mapbox styles/tiles and Geocoding v6 for the account. Enable/configure the relevant Mapbox services and billing as required by your account; requests count toward Mapbox usage. If the token has URL restrictions, allow your localhost and deployed origins. Never use a secret token in a VITE_ variable. Restart Vite after edits. Missing/invalid-token UI keeps GPS, sample city search and weather usable; reverse geocoding falls back to coordinates.

Geolocation requires HTTPS or localhost and browser permission. Do not open index.html as a local file. The app does not persist location or send it to a private backend. Coordinates go directly to Mapbox for reverse geocoding and Open-Meteo for weather. No geolocation or weather request occurs on initial mount.

## Reverse geocoding

GET `https://api.mapbox.com/search/geocode/v6/reverse`, with latitude/longitude, types=place,district,region,country and the configured public token. The adapter parses place/context names. Missing token, network/HTTP error, invalid response, empty/ocean results or an eight-second timeout fall back to hemisphere-formatted coordinates. Results are kept only in React memory. Weather requests run independently, and stale geocoding results never rename a newer selection.

## Rain outlook calculation

Open-Meteo current fields include precipitation, rain and showers; hourly includes those plus precipitation probability; daily includes precipitation_sum. Timezone is auto.

- Raining now uses current rain/showers > 0 or drizzle/rain/showers/thunderstorm WMO codes. If both liquid components are null, total precipitation is a fallback only outside snow codes. Current probability alone never means it is raining. Current values are model estimates, not a local rain sensor.
- Current mm is rain + showers, with that fallback. Unknown measurements remain null and render as unavailable (not zero). The summary intentionally extends the suggested interface with nullability and coverage metadata.
- Upcoming windows exclude the current local hourly bin: next hour, next three hourly bins and next six hourly bins. The 3h/6h values are the **maximum hourly probability**, not a combined probability of rain anywhere in the interval.
- Scan at most the next 12 local hourly bins for probability >= 50%. Snow-only codes are excluded unless liquid rain/showers are also forecast. Show a possible onset/continuation time, never a guaranteed start time. Next-day labels say tomorrow.
- If no qualifying hour exists, show no significant rain expected only when all 12 probabilities are available; otherwise show insufficient data. The highest precipitation probability in the window is also shown. Open-Meteo precipitation probability can include snow; it is not a separately trained rain model.

## Development

```powershell
npm run dev
```

Open the URL printed by Vite. Supply your real Mapbox token to verify satellite Earth and camera animation against the live service.

## Build and checks

```powershell
npm run typecheck
npm test
npm run build
npm run preview
```

Production output is `dist/`. Unit tests cover rain logic (including midnight, nulls, snow and thresholds), weather response validation/request fields, GPS error mapping and geocoding fallback. They do not render Mapbox. Real GPS permission and live Mapbox visuals require a supported browser and valid token. Vite may warn about the large Mapbox/chart bundle; this is not a TypeScript or build error.

## Future features

Real city search, weather layers, radar, wind visualization, favorite locations, historical weather and separately implemented machine-learning forecasts.

## References and attribution

- [Mapbox satellite globe example](https://docs.mapbox.com/mapbox-gl-js/example/globe-spin/)
- [Mapbox Geocoding v6](https://docs.mapbox.com/api/search/geocoding/)
- [Open-Meteo fields and WMO codes](https://open-meteo.com/en/docs)

Mapbox attribution remains visible on the map; Open-Meteo is linked in the panel and app footer.

## Cinematic weather panel

The right panel now uses one continuous local weather photograph, a 44% hero, Manrope variable typography, a dark readability overlay and a lower section with 24px backdrop blur. The lower region scrolls independently (keyboard focusable) so every metric, the full rain summary, hourly/day forecasts, chart and attribution remain available. Today's high and low temperatures are also shown as rows.

`src/utils/weatherBackground.ts` reuses the WMO presentation utility to select clear day, clear night, cloudy/partly cloudy, rain, thunderstorm, snow or fog. Clear day/night uses Open-Meteo's current `is_day`, the only added API field; unknown daylight uses the neutral cloudy background. The existing request/hook architecture and rain calculations are unchanged. Local images are under `src/assets/weather/`; each condition has its own gradient if a file is missing or fails to load. Backgrounds preload and crossfade; the previous background is retained while the next location is loading, without showing old weather as the new location's data.

These are decorative AI-generated photographic landscapes, not photographs of the selected city. The built-in imagegen prompt set and asset notes are saved alongside the images. Font files are self-hosted with `@fontsource-variable/manrope` ([Fontsource](https://fontsource.org/fonts/manrope/use)); no external font request is required.

Modified presentation files: `App.tsx` (keep the panel mounted for transitions), `WeatherPanel.tsx`, `CurrentWeather.tsx`, `WeatherDetails.tsx`, `RainForecastCard.tsx`, `HourlyForecast.tsx`, `DailyForecast.tsx`. Added `WeatherBackground.tsx`, `weather-panel.css`, `weatherBackground.ts` and mapping tests. Data additions: `CurrentWeather.isDay` and parsing/requesting `is_day` in `weatherApi.ts`; relevant test fixtures updated. `useWeather`, `rainForecast.ts` and the globe components are preserved.
