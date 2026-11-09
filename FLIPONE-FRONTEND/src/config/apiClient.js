import axios from "axios";

/**
 * The one HTTP client for the backend. Every request goes through here so that:
 *  - the base URL comes from VITE_BASE_URL (no hard-coded hosts),
 *  - the right session's token is attached (user, seller and admin can be logged in side by side),
 *  - a 401 on an authenticated request clears that session instead of leaving a dead token around.
 *
 * The store is attached from Store.js (attachStore) so this module never imports the slices
 * (slices import this module, so importing them back would be a cycle).
 */
export const BASE_URL = import.meta.env.VITE_BASE_URL ?? "";

const AUTH_ENDPOINT = /\/(login|signup)\/?$/;

/** Which session a request belongs to, decided by its API path. */
export const roleForUrl = (url = "") => {
  const path = url.replace(/^https?:\/\/[^/]+/, "");
  if (path.startsWith("/api/admin")) return "admin";
  if (path.startsWith("/api/seller")) return "seller";
  return "user";
};

/** The token for a role, read from the redux state. */
export const selectToken = (state, role) => {
  if (!state) return null;
  if (role === "admin") return state.admin?.adminInfo?.token ?? null;
  if (role === "seller") return state.seller?.sellerInfo?.token ?? null;
  return state.auth?.token ?? null;
};

let store = null;
let logoutActions = {};

/** Called once from Store.js. `actions` maps a role to the action creator that ends its session. */
export const attachStore = (reduxStore, actions) => {
  store = reduxStore;
  logoutActions = actions;
};

const apiClient = axios.create({ baseURL: BASE_URL });

apiClient.interceptors.request.use((config) => {
  // Login/signup never carry a token: a failed login must not log out an existing session.
  if (AUTH_ENDPOINT.test(config.url ?? "")) return config;

  const role = roleForUrl(config.url);
  const token = selectToken(store?.getState(), role);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.authRole = role;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const role = error.config?.authRole;
    if (error.response?.status === 401 && role && store) {
      const logout = logoutActions[role];
      if (logout) store.dispatch(logout());
    }
    return Promise.reject(error);
  }
);

/** The backend's error message, or a fallback. */
export const NETWORK_ERROR_MESSAGE = "Could not reach FlipOne. Check your connection and try again.";

/** The API's own message, a clear line when the request never got a response, else the fallback. */
export const apiErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) return error.response.data.message;
  // axios sets `request` but no `response` when the server was unreachable (offline, refused, CORS, timeout)
  if (error?.isAxiosError && error.request && !error.response) return NETWORK_ERROR_MESSAGE;
  return fallback;
};

export default apiClient;
