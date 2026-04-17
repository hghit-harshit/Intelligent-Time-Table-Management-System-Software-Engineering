const TOKEN_KEY = "timetable_access_token";

export const withAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};
