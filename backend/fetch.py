import os
import httpx
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List

CF_API_BASE = "https://api.cloudflare.com/client/v4/radar"
CF_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")  # Set in your environment
HEADERS = {"Authorization": f"Bearer {CF_TOKEN}"} if CF_TOKEN else {}

async def fetch_events(limit: int = 50) -> Dict[str, Any]:
    """
    Fetch top Layer 7 target locations from Cloudflare Radar.
    Returns { "arcs": [ { origin, target, value }, ... ] }
    Falls back to mock data if API returns empty or fails.
    """
    # Build last hour time range in UTC
    end_time = datetime.now(timezone.utc)
    start_time = end_time - timedelta(hours=1)
    date_start = start_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    date_end = end_time.strftime("%Y-%m-%dT%H:%M:%SZ")

    url = f"{CF_API_BASE}/attacks/layer7/top/locations/target"
    params = {"limit": limit, "dateStart": date_start, "dateEnd": date_end}

    arcs: List[Dict[str, Any]] = []

    try:
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
                        arcs.append({
                            "origin": origin,
                            "target": target,
                            "value": value
                        })

    except Exception as e:
        print(f"Cloudflare fetch failed: {e}")

    # Fallback to mock data if empty
    if not arcs:
        arcs = [
            {"origin": "RU", "target": "US", "value": 120},
            {"origin": "CN", "target": "DE", "value": 80},
            {"origin": "BR", "target": "FR", "value": 50},
            {"origin": "IN", "target": "JP", "value": 70},
        ]

    return {"arcs": arcs}
