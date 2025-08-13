const map = L.map('map').setView([20, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

let activeAttacks = [];

const countryCoords = {
  "US": [37.0902, -95.7129], "RU": [61.5240, 105.3188], "CN": [35.8617, 104.1954],
  "DE": [51.1657, 10.4515], "FR": [46.2276, 2.2137], "BR": [-14.2350, -51.9253],
  "IN": [20.5937, 78.9629], "JP": [36.2048, 138.2529], "GB": [55.3781, -3.4360],
  "CA": [56.1304, -106.3468], "AU": [-25.2744, 133.7751], "KR": [35.9078, 127.7669],
  "IT": [41.8719, 12.5674], "SG": [1.3521, 103.8198], "UA": [48.3794, 31.1656],
  "MX": [23.6345, -102.5528], "TH": [15.8700, 100.9925], "VN": [14.0583, 108.2772],
  "EG": [26.8206, 30.8025], "TR": [38.9637, 35.2433], "SA": [23.8859, 45.0792]
};

function countryToLatLng(code) {
  return countryCoords[code] || null;
}

function getRandomBrightColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 90%, 55%)`;
}

function getContrastingColor(color) {
  const match = color.match(/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/);
  if (!match) return "#fff";
  let hue = (parseInt(match[1]) + 180) % 360;
  return `hsl(${hue}, 90%, 60%)`;
}

// Generate random attacks
function generateRandomAttacks(count = 5) {
  const keys = Object.keys(countryCoords);
  const attacks = [];
  for (let i = 0; i < count; i++) {
    const origin = keys[Math.floor(Math.random() * keys.length)];
    let target = keys[Math.floor(Math.random() * keys.length)];
    while (target === origin) target = keys[Math.floor(Math.random() * keys.length)];
    attacks.push({
      origin,
      target,
      value: Math.floor(Math.random() * 500) + 50
    });
  }
  return attacks;
}

function spawnAttack(arc) {
  const origin = countryToLatLng(arc.origin);
  const target = countryToLatLng(arc.target);
  if (!origin || !target) return;

  const controlPoint = [
    (origin[0] + target[0]) / 2 + (Math.random() * 20 - 10),
    (origin[1] + target[1]) / 2 + (Math.random() * 20 - 10)
  ];

  const lineColor = getRandomBrightColor();
  const dotColor = getContrastingColor(lineColor);
  const weight = 2 + Math.min(arc.value / 100, 6);

  const path = L.curve(['M', origin, 'Q', controlPoint, target], {
    color: lineColor,
    weight,
    opacity: 1
  }).addTo(map);

  const dotEl = document.createElement('div');
  dotEl.className = 'attack-dot';
  dotEl.style.backgroundColor = dotColor;
  dotEl.style.width = '6px';
  dotEl.style.height = '6px';
  dotEl.style.borderRadius = '50%';
  dotEl.style.boxShadow = `0 0 6px ${dotColor}`;

  const dotMarker = L.marker(origin, {
    icon: L.divIcon({
      className: '',
      html: dotEl,
      iconSize: [6, 6],
      iconAnchor: [3, 3]
    })
  }).addTo(map);

  const duration = 1500 + Math.random() * 2000; // 1.5–3.5 sec
  animateAttack(path, dotMarker, duration);
}

function animateAttack(path, dotMarker, duration) {
  const start = performance.now();
  const el = path.getElement();
  if (!el) return;
  const length = el.getTotalLength();
  el.style.strokeDasharray = length;
  el.style.strokeDashoffset = length;

  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    el.style.strokeDashoffset = length - length * t;

    const point = el.getPointAtLength(length * t);
    dotMarker.setLatLng(map.layerPointToLatLng(L.point(point.x, point.y)));

    if (t < 1) requestAnimationFrame(step);
    else {
      map.removeLayer(path);
      map.removeLayer(dotMarker);
    }
  }
  requestAnimationFrame(step);
}

// Clear old attacks that finished and spawn new ones
function refreshAttacks() {
  const attacks = generateRandomAttacks(Math.floor(Math.random() * 5) + 3);
  attacks.forEach(arc => spawnAttack(arc));
}

// Update every 2 seconds
setInterval(refreshAttacks, 2000);
refreshAttacks();
