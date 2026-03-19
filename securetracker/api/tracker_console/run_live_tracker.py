import time
import random
import requests
from datetime import datetime, timezone

from config import (
    TRACKER_BASE_URL,
    TRACKING_RECORD_ENDPOINT,
    INTERVAL_SECONDS
)
from token_helper import get_bearer_token


def simulate_next_point(lat, lon):
    lat += random.uniform(-0.0005, 0.0005)
    lon += random.uniform(-0.0005, 0.0005)
    return round(lat, 6), round(lon, 6)


def ask_asset_id() -> int:
    while True:
        val = input(" Enter asset id (integer): ").strip()
        if val.isdigit():
            return int(val)
        print(" Invalid asset id. Please enter a number like 24.")


def main():
    # ask user at runtime
    asset_id = ask_asset_id()

    url = f"{TRACKER_BASE_URL}{TRACKING_RECORD_ENDPOINT}"

    # Starting coordinates (demo)
    lat, lon = 13.0827, 80.2707

    print("\nSecureTracker Live Tracking Console (Prompt Asset ID)")
    print(f"POST {url}")
    print(f"asset_id = {asset_id}")
    print(f" interval = {INTERVAL_SECONDS}s\n")

    while True:
        lat, lon = simulate_next_point(lat, lon)

        payload = {
            "asset_id": asset_id,
            "latitude": lat,
            "longitude": lon,
            "altitude": round(random.uniform(5, 25), 2),
            "speed": round(random.uniform(10, 60), 2),
            "heading": round(random.uniform(0, 359), 2),
            "accuracy": round(random.uniform(3, 15), 2),
            # timezone-aware UTC time (no deprecation warning)
            "client_time": datetime.now(timezone.utc).isoformat()
        }

        try:
            token = get_bearer_token()
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }

            r = requests.post(url, json=payload, headers=headers, timeout=10)

            if r.status_code == 200:
                print(f"[SENT] lat={lat} lon={lon} speed={payload['speed']} heading={payload['heading']}")
            elif r.status_code == 401:
                # auto refresh token and retry once
                token = get_bearer_token(force_refresh=True)
                headers["Authorization"] = f"Bearer {token}"
                r2 = requests.post(url, json=payload, headers=headers, timeout=10)

                if r2.status_code == 200:
                    print(f"[SENT] lat={lat} lon={lon} speed={payload['speed']} heading={payload['heading']}")
                else:
                    print(f"[ERROR {r2.status_code}] {r2.text}")
            elif r.status_code == 403:
                print(f"[FORBIDDEN 403] {r.text}")
                break
            else:
                print(f"[ERROR {r.status_code}] {r.text}")

        except Exception as e:
            print(f"[REQUEST FAILED] {e}")

        time.sleep(INTERVAL_SECONDS)


if __name__ == "__main__":
    main()