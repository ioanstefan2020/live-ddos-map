# main.py (snippet)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import os
from fetch import fetch_events



# backend/main.py
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx, datetime
from apscheduler.schedulers.background import BackgroundScheduler

app = FastAPI()

@app.get("/config")
def get_config():
    # Pass your Mapbox token to the front-end
    return {"mapboxToken": os.getenv("MAPBOX_TOKEN", "")}

@app.get("/events")
async def events(dateRange: str = "1h"):
    data = await fetch_events(date_range=dateRange)
    return JSONResponse(data)
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

events = []  # in-memory store

async def fetch_data():
    url = "https://api.cloudflare.com/client/v4/radar/ddos/activity/layer3"  # example endpoint
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        if r.status_code == 200:
            data = r.json()
            ts = datetime.datetime.utcnow().isoformat()
            for item in data.get("result", []):
                events.append({
                    "timestamp": ts,
                    "country": item.get("country", "??"),
                    "value": item.get("value", 0)
                })
            # keep only last 120 entries
            while len(events) > 120:
                events.pop(0)

@app.on_event("startup")
async def startup_event():
    scheduler = BackgroundScheduler()
    scheduler.add_job(lambda: asyncio.run(fetch_data()), 'interval', minutes=1)
    scheduler.start()

@app.get("/events")
async def get_events():
    return events
