// script.js — lightweight front-end that:
// 1) fetches /config for Mapbox token
// 2) initializes the map
// 3) pulls /events and draws lines (arcs) + points
//
// Requirements in your index.html:
// - Mapbox GL JS CSS + JS loaded
// - <div id="map"></div>
// - <div id="legend" class="panel"></div><div id="status" class="panel"></div>

const CONFIG_URL = "/config";
const EVENTS_URL = "/events";
let map;
let centroidsByCCA2 = {}; // e.g. { "US": [lng,lat], ... }
let refreshTimer;

async function fetchConfig() {
  const res = await fetch(CONFIG_URL);
  if (!res.ok) throw new Error("Failed to load /config");
  return res.json();
}

// Pull country coords (uses REST Countries; provides cca2 + latlng)
async function loadCountryCentroids() {
  const res = await fetch("https://restcountries.com/v3.1/all");
  if (!res.ok) throw new Error("Failed to load country coordinates");
  const all = await res.json();
  for (const c of all) {
    const code = c.cca2;
    const latlng = c.latlng; // [lat, lng]
    if (code && Array.isArray(latlng) && latlng.length === 2) {
      const lngLat = [latlng[1], latlng[0]]; // convert to [lng, lat]
      centroidsByCCA2[code.toUpperCase()] = lngLat;
    }
  }
}

function makeLineFeature(originLngLat, targetLngLat, weight = 1) {
  return {
    type: "Feature",
    geometry: { type: "LineString", coordinates: [originLngLat, targetLngLat] },
    properties: { weight }
  };
}

function makePointFeature(lngLat, value = 1) {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: lngLat },
    properties: { value }
  };
}

async function drawEvents() {
  const status = document.getElementById("status");
  status.textContent = "Loading events…";
  const res = await fetch(`${EVENTS_URL}?dateRange=1h`);
  if (!res.ok) {
    status.textContent = "Failed to load /events";
    return;
  }
  const data = await res.json();
  const arcs = data.arcs || [];

  const lineFeatures = [];
  const pointFeatures = [];

  for (const arc of arcs) {
    const o = centroidsByCCA2[arc.origin];
    const t = centroidsByCCA2[arc.target];
    if (!o || !t) continue;

    lineFeatures.push(makeLineFeature(o, t, arc.value));
    pointFeatures.push(makePointFeature(t, arc.value));
  }

  const lines = { type: "FeatureCollection", features: lineFeatures };
  const points = { type: "FeatureCollection", features: pointFeatures };

  // Update or add sources
  if (map.getSource("attack-lines")) {
    map.getSource("attack-lines").setData(lines);
  } else {
    map.addSource("attack-lines", { type: "geojson", data: lines });
    map.addLayer({
      id: "attack-lines",
      type: "line",
      source: "attack-lines",
      paint: {
        "line-width": [
          "interpolate", ["linear"], ["get", "weight"],
          0, 0.5,
          10, 3
        ],
        "line-opacity": 0.75
      }
    });
  }

  if (map.getSource("attack-points")) {
    map.getSource("attack-points").setData(points);
  } else {
    map.addSource("attack-points", { type: "geojson", data: points });
    map.addLayer({
      id: "attack-points",
      type: "circle",
      source: "attack-points",
      paint: {
        "circle-radius": [
          "interpolate", ["linear"], ["get", "value"],
          0, 2,
          10, 10
        ],
        "circle-opacity": 0.8
      }
    });
  }

  const total = arcs.length;
  status.textContent = `Showing ${total} attack flows (Layer 7, last 1h). Auto-refreshing…`;
}

async function main() {
  const config = await fetchConfig();
  if (!config.mapboxToken) {
    alert("Missing MAPBOX_TOKEN on server (/config)");
    return;
  }
  mapboxgl.accessToken = config.mapboxToken;

  await loadCountryCentroids();

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/dark-v11",
    center: [0, 20],
    zoom: 1.2
  });

  map.addControl(new mapboxgl.NavigationControl());

  map.on("load", async () => {
    document.getElementById("legend").innerHTML =
      `<span class="badge">L7</span> Live DDoS flows (Cloudflare Radar)`;

    await drawEvents();
    // refresh every 30s
    refreshTimer = setInterval(drawEvents, 30000);
  });
}

window.addEventListener("DOMContentLoaded", main);
