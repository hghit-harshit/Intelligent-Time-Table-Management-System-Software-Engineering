export const withAuthHeaders = (headers: Record<string, string> = {}) => {
  const token = localStorage.getItem("authToken");
  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};
