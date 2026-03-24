import requests
from config import BASE_URL, LOGIN_ENDPOINT, OTP_VERIFY_ENDPOINT, USERNAME, PASSWORD, OTP

def login_get_token():
    """
    Tries:
      1) POST login -> if token present return
      2) If OTP required and OTP provided -> POST verify -> return token
    """
    login_url = BASE_URL + LOGIN_ENDPOINT

    payload = {
        "username": USERNAME,
        "password": PASSWORD
    }

    r = requests.post(login_url, json=payload)
    if r.status_code != 200:
        raise Exception(f"Login failed: {r.status_code} | {r.text}")

    data = r.json()

    # Case A: token is directly returned
    token = data.get("access_token") or data.get("token") or data.get("jwt")
    if token:
        return token

    # Case B: OTP flow (backend may return something like temp_id / session_id)
    # We don't assume exact field names; we try common ones.
    temp_id = data.get("temp_id") or data.get("session_id") or data.get("transaction_id")

    if not OTP:
        raise Exception("OTP required but TRACKER_OTP not set in .env")

    verify_url = BASE_URL + OTP_VERIFY_ENDPOINT
    verify_payload = {
        "otp": OTP
    }

    # If backend expects temp/session id, pass it when available
    if temp_id:
        verify_payload["temp_id"] = temp_id

    vr = requests.post(verify_url, json=verify_payload)
    if vr.status_code != 200:
        raise Exception(f"OTP verify failed: {vr.status_code} | {vr.text}")

    vdata = vr.json()
    vtoken = vdata.get("access_token") or vdata.get("token") or vdata.get("jwt")

    if not vtoken:
        raise Exception("OTP verify succeeded but token not found in response JSON")

    return vtoken