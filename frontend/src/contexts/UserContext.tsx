import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getUser, getAccessToken, clearAuth as clearUser, fetchProfile } from "../services/authApi";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "professor" | "student";
  isActive: boolean;
  createdAt: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({ user: null, loading: true, refreshUser: async () => {}, logout: () => {} });

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }
    const stored = getUser();
    if (stored) {
      setUser(stored);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const userData = await fetchProfile();
      setUser(userData);
    } catch {
      clearUser();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearUser();
    setUser(null);
    window.location.href = "/";
  }, []);

  useEffect(() => {
    const stored = getUser();
    if (stored) {
      setUser(stored);
    }
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const handleStorage = () => {
      refreshUser();
    };
    const handleLoginSuccess = () => {
      refreshUser();
    };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("login-success", handleLoginSuccess);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("login-success", handleLoginSuccess);
    };
  }, [refreshUser]);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}