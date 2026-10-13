import { API_BASE } from "./dataProvider";

const TOKEN_KEY = "admin_access_token";
const USER_KEY = "admin_user";

export const authProvider = {
  async login({ username, password }) {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: username, password }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.access_token || body.user?.role !== "admin") {
      throw new Error(body.message || "Administrator login failed");
    }
    localStorage.setItem(TOKEN_KEY, body.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(body.user));
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return Promise.resolve();
  },

  checkError({ status }) {
    if (status === 401 || status === 403) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      return Promise.reject();
    }
    return Promise.resolve();
  },

  checkAuth() {
    return localStorage.getItem(TOKEN_KEY)
      ? Promise.resolve()
      : Promise.reject();
  },

  getPermissions() {
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      return Promise.resolve(user?.role || null);
    } catch {
      return Promise.resolve(null);
    }
  },

  getIdentity() {
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      return Promise.resolve({
        id: user?.uid,
        name: user?.name,
        email: user?.email,
      });
    } catch {
      return Promise.reject();
    }
  },
};
