import requests
import time
import random
from datetime import datetime
from config import BASE_URL, TRACKING_ENDPOINT, ASSET_ID

def send_live_tracking(jwt_token, interval_seconds=5):
    if not ASSET_ID:
        raise Exception("ASSET_ID missing. Set ASSET_ID in tracker_console/.env")

    tracking_url = BASE_URL + TRACKING_ENDPOINT
    headers = {
        "Authorization": f"Bearer {jwt_token}",
        "Content-Type": "application/json"
    }

    # Start point (Chennai-like coordinates, just for movement simulation)
    lat = 13.0827
    lon = 80.2707

    print("Live tracking started...")
    print(f"Sending to: {tracking_url}")
    print(f"Asset: {ASSET_ID}")

    while True:
        # simulate small movement
        lat += random.uniform(-0.0005, 0.0005)
        lon += random.uniform(-0.0005, 0.0005)

        payload = {
            "asset_id": ASSET_ID,
            "latitude": round(lat, 6),
            "longitude": round(lon, 6),
            "speed": round(random.uniform(10, 60), 2),
            "timestamp": datetime.utcnow().isoformat()
        }

        try:
            r = requests.post(tracking_url, json=payload, headers=headers)
            if r.status_code == 200:
                print(f"[SENT] {payload}")
            else:
                print(f"[{r.status_code}] {r.text}")
        except Exception as e:
            print(f"[ERROR] {e}")

        time.sleep(interval_seconds)