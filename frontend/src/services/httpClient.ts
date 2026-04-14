import { API_BASE_URL } from "../config/constants";
import { withAuthHeaders } from "./authInterceptor";

const withJson = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }
  return data as T;
};

const normalizeHeaders = (headers?: HeadersInit): Record<string, string> => {
  if (!headers) return {};
  if (headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return headers;
};

export const httpClient = {
  get: async <T>(path: string) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: withAuthHeaders(),
    });
    return withJson<T>(response);
  },

  request: async <T>(path: string, options: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: withAuthHeaders(normalizeHeaders(options.headers)),
    });
    return withJson<T>(response);
  },
};
