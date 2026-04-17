import {
  AUTH_LOGIN_EP,
  AUTH_REGISTER_EP,
  AUTH_REFRESH_EP,
  AUTH_PROFILE_EP,
} from "../constants/Api_constants";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface ProfileResponse {
  success: boolean;
  data: User;
}

const TOKEN_KEY = "timetable_access_token";
const REFRESH_KEY = "timetable_refresh_token";
const USER_KEY = "timetable_user";

export const setTokens = (tokens: AuthTokens) => {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
};

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_KEY);
};

export const setUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: "admin" | "professor" | "student";
}

interface LoginInput {
  email: string;
  password: string;
}

export const login = async (input: LoginInput): Promise<AuthTokens> => {
  const response = await fetch(AUTH_LOGIN_EP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  setTokens(data);

  // Fetch and store user profile after login
  try {
    const profileRes = await fetch(AUTH_PROFILE_EP, {
      headers: { Authorization: `Bearer ${data.accessToken}` },
    });
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      if (profileData.data) {
        setUser(profileData.data);
      }
    }
  } catch {
    // Ignore - user will be fetched on page load
  }

  return data;
};

export const register = async (input: RegisterInput): Promise<AuthTokens> => {
  const response = await fetch(AUTH_REGISTER_EP, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
  }

  setTokens(data);

  // Fetch and store user profile after registration (role comes from input)
  setUser({
    _id: "", // Will be updated on profile fetch
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    role: input.role,
    isActive: true,
    lastLogin: "",
    createdAt: "",
    updatedAt: "",
  });

  return data;
};

export const fetchProfile = async (): Promise<User> => {
  const token = getAccessToken();
  const response = await fetch(AUTH_PROFILE_EP, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data: ProfileResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch profile");
  }

  setUser(data.data);
  return data.data;
};

export const logout = () => {
  clearAuth();
};
