# fetch.py
# Minimal Cloudflare Radar client for a live DDoS map (Layer 7 "top attacks").
# Exposes one async function: fetch_events(date_range="1h")

import os
from typing import Dict, Any, List
import httpx

CF_API_BASE = "https://api.cloudflare.com/client/v4/radar"
CF_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")  # set this in your environment / .env

HEADERS = {"Authorization": f"Bearer {CF_TOKEN}"} if CF_TOKEN else {}


async def _fetch_l7_top_attacks(date_range: str = "1h", limit: int = 50) -> Dict[str, Any]:
    """
    Calls Cloudflare Radar 'top attacks' (Layer 7) and returns arcs:
    Each arc = { origin: 'US', target: 'DE', value: float }
    Docs & endpoint: /radar/attacks/layer7/top/attacks (requires Bearer token)
    """
    url = f"{CF_API_BASE}/attacks/layer7/top/attacks"
    params = {"dateRange": date_range, "limit": str(limit), "format": "json"}
    async with httpx.AsyncClient(timeout=20.0) as client:
        r = await client.get(url, params=params, headers=HEADERS)
        r.raise_for_status()
        result = r.json().get("result", {})

    arcs: List[Dict[str, Any]] = []
    for key, rows in result.items():
        # API returns keys like "top_0", "top_1" plus "meta"
        if key.startswith("top_") and isinstance(rows, list):
            for row in rows:
                origin = row.get("originCountryAlpha2")
                target = row.get("targetCountryAlpha2")
                value = float(row.get("value", 0) or 0)
                if origin and target:
                    arcs.append({"origin": origin, "target": target, "value": value})

    return {"arcs": arcs, "meta": result.get("meta", {})}


async def fetch_events(date_range: str = "1h") -> Dict[str, Any]:
    """
    Public function your FastAPI route should call.
    Returns {"arcs": [...], "meta": {...}}
    """
    return await _fetch_l7_top_attacks(date_range=date_range, limit=50)
