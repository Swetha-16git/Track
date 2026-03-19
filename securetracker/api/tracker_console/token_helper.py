import os
import time
import requests

# Cache token in memory so we don't login every time
_cached_token = None
_cached_token_time = 0


def _login_and_get_token() -> str:
    base_url = os.getenv("TRACKER_BASE_URL", "http://127.0.0.1:8000").rstrip("/")
    username = os.getenv("TRACKER_USERNAME", "")
    password = os.getenv("TRACKER_PASSWORD", "")

    if not username or not password:
        raise Exception(
            "TRACKER_USERNAME / TRACKER_PASSWORD missing in .env. "
            "Add them to enable auto-login."
        )

    login_url = f"{base_url}/api/v1/auth/login"

    r = requests.post(
        login_url,
        json={"username": username, "password": password},
        timeout=10
    )

    if r.status_code != 200:
        raise Exception(f"Login failed ({r.status_code}): {r.text}")

    data = r.json()

    token = data.get("access_token") or data.get("token") or data.get("jwt")
    if not token:
        raise Exception(f"Token not found in login response: {data}")

    return token


def get_bearer_token(force_refresh: bool = False) -> str:
    """
    Returns a cached token.
    Refreshes if:
      - force_refresh=True
      - token missing
      - token older than 12 minutes (safe refresh without decoding)
    """
    global _cached_token, _cached_token_time

    # refresh every 12 minutes to avoid expiry issues (no need decode JWT)
    MAX_AGE_SECONDS = 12 * 60

    if force_refresh or (_cached_token is None) or (time.time() - _cached_token_time > MAX_AGE_SECONDS):
        _cached_token = _login_and_get_token()
        _cached_token_time = time.time()

    return _cached_token