// Initialize Leaflet map
const map = L.map('map').setView([20, 0], 2); // world view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Function to fetch events and draw arcs
async function updateMap() {
  const response = await fetch("http://127.0.0.1:8000/events");
  const data = await response.json();
  
  // Clear existing layers
  map.eachLayer(layer => {
    if (layer instanceof L.Polyline) map.removeLayer(layer);
  });

  data.arcs.forEach(arc => {
    // Use Leaflet to draw line between origin and target
    const origin = countryToLatLng(arc.origin);
    const target = countryToLatLng(arc.target);

    if (origin && target) {
      L.polyline([origin, target], {
        color: 'red',
        weight: Math.min(arc.value / 50, 5) // weight based on value
      }).addTo(map);
    }
  });
}

// Minimal country code → lat/lng mapping
const countryCoords = {
  "US": [37.0902, -95.7129],
  "RU": [61.5240, 105.3188],
  "CN": [35.8617, 104.1954],
  "DE": [51.1657, 10.4515],
  "FR": [46.2276, 2.2137],
  "BR": [-14.2350, -51.9253],
  "IN": [20.5937, 78.9629],
  "JP": [36.2048, 138.2529],
  "GB": [55.3781, -3.4360],
  "CA": [56.1304, -106.3468],
  "AU": [-25.2744, 133.7751],
  "KR": [35.9078, 127.7669],
  "IT": [41.8719, 12.5674],
  // Add more as needed
};
function countryToLatLng(code) {
  return countryCoords[code];
}
// Update every 60 seconds
updateMap();
setInterval(updateMap, 60000);
