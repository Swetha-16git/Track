import api from "./api";

const authService = {
  // POST /api/v1/auth/login
  login: async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  // POST /api/v1/auth/signup
  signup: async (payload) => {
    const { data } = await api.post("/auth/signup", payload);
    return data;
  },

  // POST /api/v1/auth/verify-mfa  (ONLY if requires_mfa === true)
  verifyMFA: async (payload) => {
    const { data } = await api.post("/auth/verify-mfa", payload);
    return data;
  },

  // POST /api/v1/auth/refresh
  refresh: async (payload) => {
    const { data } = await api.post("/auth/refresh", payload);
    return data;
  },

  // GET /api/v1/auth/me
  me: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

export default authService;