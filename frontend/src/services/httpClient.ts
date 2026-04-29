import { API_BASE_URL } from "../config/constants";
import { withAuthHeaders } from "./authInterceptor";
import { clearAuth, getRefreshToken, setTokens } from "./authApi";

const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const withJson = async (response) => {
  const data = await parseJsonSafe(response);
  if (!response.ok) {
    throw new Error((data && data.message) || "Request failed");
  }
  return data;
};

const normalizeHeaders = (headers) => {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
};

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return false;
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok || !data?.accessToken || !data?.refreshToken) {
    return false;
  }

  setTokens(data);
  return true;
};

const requestWithAuth = async (path, options = undefined) => {
  const requestOptions = options || {};
  const runRequest = () =>
    fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers: withAuthHeaders(normalizeHeaders(requestOptions.headers)),
    });

  let response = await runRequest();
  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await runRequest();
    } else {
      clearAuth();
    }
  }

  return response;
};

export const httpClient = {
  get: async (path) => {
    const response = await requestWithAuth(path);
    return withJson(response);
  },

  request: async (path, options) => {
    const response = await requestWithAuth(path, options);
    return withJson(response);
  },
};
