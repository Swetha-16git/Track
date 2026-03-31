from typing import Dict, Any, List
from app.database.client_provisioning_db import provision_client
from app.database.organisation_db import fetch_clients_summary

def provision_new_client(client_name: str, client_code: str, contact_email: str) -> Dict[str, str]:
    """
    Service layer to provision a new client:
    - creates tenant DB + prefixed tables
    - upserts client registry in master
    """
    return provision_client(
        client_name=client_name,
        client_code=client_code,
        contact_email=contact_email
    )

def list_clients_summary() -> List[Dict[str, Any]]:
    """
    Returns list of onboarded clients for Admin dashboard
    """
    return fetch_clients_summary()