import authService from "./authService";
 
/**
 * Base URL for admin client provisioning
 * Adjust only if backend base path changes
 */
const BASE_URL = "http://localhost:8000/api/v1/admin/clients";
 
const getAuthHeaders = () => {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");
 
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};
 
const organisationService = {
  /**
   * ✅ Create / Provision a new client
   * This API:
   *  - creates a new client database
   *  - creates all onboarding + asset tables
   *  - stores client registry in master DB
   */
  provisionClient: async (payload) => {
    try {
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
    } catch (err) {
      console.error("❌ Provision client error:", err);
      throw err;
    }
  },
 
  /**
   * ✅ (Optional – future)
   * Fetch all onboarded clients for Admin Dashboard cards
   */
  getAllClients: async () => {
    try {
      const response = await fetch(`${BASE_URL}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
 
      if (!response.ok) {
        throw new Error("Failed to fetch clients");
      }
 
      return await response.json();
    } catch (err) {
      console.error("❌ Fetch clients error:", err);
      throw err;
    }
  },
};
 
export default organisationService;
 