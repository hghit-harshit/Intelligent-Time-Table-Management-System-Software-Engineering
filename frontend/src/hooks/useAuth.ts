import { useMemo } from "react";

export const useAuth = () => {
  return useMemo(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("authToken");
    return {
      isAuthenticated: Boolean(token),
      role,
    };
  }, []);
};
