import os
from dotenv import load_dotenv

load_dotenv()

TRACKER_BASE_URL = os.getenv("TRACKER_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
TRACKING_RECORD_ENDPOINT = os.getenv("TRACKING_RECORD_ENDPOINT", "/api/v1/tracking/record")
INTERVAL_SECONDS = int(os.getenv("INTERVAL_SECONDS", "3"))