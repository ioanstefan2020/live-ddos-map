import os
import random
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

import httpx

# Cloudflare Radar API config
CF_API_BASE = "https://api.cloudflare.com/client/v1/radar"
CF_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
HEADERS = {"Authorization": f"Bearer {CF_TOKEN}"} if CF_TOKEN else {}

# Expanded country list
COUNTRIES = [
    "US","RU","CN","DE","FR","BR","IN","JP","GB","CA","AU","KR","IT","SG",
    "UA","MX","ZA","ES","NL","SE","NO","FI","PL","BE","CH","AT","IE","NZ",
    "AR","CL","CO","PE","VE","TH","MY","ID","PH","VN","EG","TR","SA","AE",
    "IL","IR","PK","BD","NG","KE","DZ","MA","TN","GR","PT","HU","CZ","RO",
    "SK","BG","RS","HR","SI","LT","LV","EE"
]

async def fetch_events(limit: int = 50) -> Dict[str, Any]:
    """
    Fetch top Layer 7 attacks from Cloudflare Radar.
    If API fails, generate fully randomized mock attacks.
    """
    arcs: List[Dict[str, Any]] = []

    # Try real API first
    try:
        end_time = datetime.now(timezone.utc)
        start_time = end_time - timedelta(hours=1)
        date_start = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
        date_end = end_time.strftime("%Y-%m-%dT%H:%M:%SZ")

        url = f"{CF_API_BASE}/attacks/layer7/top/locations/target"
        params = {"limit": limit, "dateStart": date_start, "dateEnd": date_end}

        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.get(url, headers=HEADERS, params=params)
            resp.raise_for_status()
            body = resp.json()

        result = body.get("result", {})
        for arr in result.values():
            if isinstance(arr, list):
                for item in arr:
                    origin = item.get("originCountryAlpha2")
                    target = item.get("targetCountryAlpha2")
                    value = float(item.get("value", 0) or 0)
                    if origin and target:
                        arcs.append({"origin": origin, "target": target, "value": value})

    except Exception as e:
        print(f"[fetch_events] Cloudflare API fetch failed: {e}")
        arcs = []

    # If no real data or empty, generate random attacks
    if not arcs:
        arcs = generate_random_attacks(limit)

    return {"arcs": arcs}


def generate_random_attacks(max_limit: int) -> List[Dict[str, Any]]:
    """
    Fully randomized mock attacks.
    - Random number of attacks each fetch
    - Random origin/target/magnitude
    - Supports multiple attacks to same target
    """
    attacks: List[Dict[str, Any]] = []

    # Random number of attacks, Gaussian around 4-5, allow big spikes
    num_attacks = min(max_limit, max(3, int(random.gauss(4.5, 3))))
    
    for _ in range(num_attacks):
        origin = random.choice(COUNTRIES)
        target = random.choice(COUNTRIES)
        while target == origin:
            target = random.choice(COUNTRIES)

        # Random magnitude
        value = round(random.uniform(20, 500), 1)

        attacks.append({"origin": origin, "target": target, "value": value})

        # Occasionally generate concentrated attacks on same target
        if random.random() < 0.2:
            extra_hits = random.randint(1, 4)
            for _ in range(extra_hits):
                origin2 = random.choice(COUNTRIES)
                while origin2 == target:
                    origin2 = random.choice(COUNTRIES)
                attacks.append({"origin": origin2, "target": target, "value": round(random.uniform(50, 400), 1)})

    random.shuffle(attacks)
    return attacks[:max_limit]
