from typing import List, Dict, Any
from app.database.client_provisioning_db import get_clients_summary

def fetch_clients_summary() -> List[Dict[str, Any]]:
    return get_clients_summary()