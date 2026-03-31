import authService from "./authService";

/**
 * Base URL for admin client provisioning
 */
const BASE_URL = "http://localhost:8000/api/v1/admin/clients";

const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

const organisationService = {
  /**
   * ✅ Create / Provision a new client
   */
  provisionClient: async (payload) => {
    const response = await fetch(`${BASE_URL}/provision`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Client provisioning failed");
    }

    return await response.json();
  },

  /**
   * ✅ Fetch onboarded clients for Admin Dashboard cards
   */
  getAllClients: async () => {
    // Use /summary (and backend also supports GET / for compatibility)
    const response = await fetch(`${BASE_URL}/summary`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || "Failed to fetch clients");
    }

    return await response.json();
  },
};

export default organisationService;