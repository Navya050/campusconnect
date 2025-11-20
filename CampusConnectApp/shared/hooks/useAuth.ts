import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import storage from "../utils/storage";
import { config } from "@/shared/config";
import socketService from "../services/socketService";

const API_URL = config.API_URL;

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  educationLevel: string;
  category: string;
  graduationYear: string;
}

interface AuthResponse {
  token: string;
  expiresIn: number;
  user?: any;
}

// API functions using fetch instead of axios
const authAPI = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log("testing", API_URL);
    // Login request
    const response = await fetch(`${API_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error("Login failed");
    }

    const data = await response.json();
    console.log("resp:", data);

    const { token, expiresIn, user } = data;

    // Store token
    await storage.setItem("token", token);
    await storage.setItem(
      "tokenExpiry",
      (Date.now() + expiresIn * 1000).toString()
    );

    await storage.setItem("userData", JSON.stringify(user));

    return data;
  },

  async signup(userData: SignupData): Promise<AuthResponse> {
    console.log("userData: ", userData);
    try {
      const response = await fetch(`${API_URL}/user/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Signup response:", data);

      if (!response.ok) {
        throw new Error(data.data || "Signup failed");
      }

      // Backend returns { success: true, data: user, group: {...} }
      // But we need to return AuthResponse format for consistency
      return {
        token: "", // Signup doesn't return token, user needs to login
        expiresIn: 0,
        user: data.data,
      };
    } catch (error) {
      console.error("Signup API error:", error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    // Disconnect socket before clearing storage
    socketService.disconnect();
    await storage.multiRemove(["token", "tokenExpiry", "userData"]);
  },

  async getToken(): Promise<string | null> {
    const token = await storage.getItem("token");
    const expiry = await storage.getItem("tokenExpiry");

    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }

    await authAPI.logout();
    return null;
  },

  async isAuthenticated(): Promise<boolean> {
    return (await authAPI.getToken()) !== null;
  },
};

// Query keys
const authKeys = {
  all: ["auth"] as const,
  token: () => [...authKeys.all, "token"] as const,
  isAuthenticated: () => [...authKeys.all, "isAuthenticated"] as const,
};

// Custom hooks using TanStack Query
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      // Invalidate and refetch auth-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.isAuthenticated(), true);
    },
    onError: (error) => {
      console.error("Login error:", error);
    },
  });
};

export const useSignup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.signup,
    onSuccess: (data) => {
      // Invalidate and refetch auth-related queries
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: (error) => {
      console.error("Signup error:", error);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      // Clear all auth-related data from cache
      queryClient.setQueryData(authKeys.isAuthenticated(), false);
      queryClient.setQueryData(authKeys.token(), null);
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
};

export const useAuthToken = () => {
  return useQuery({
    queryKey: authKeys.token(),
    queryFn: authAPI.getToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: authKeys.isAuthenticated(),
    queryFn: authAPI.isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Export the API for backward compatibility (if needed)
export { authAPI };

// Export types
export type { LoginCredentials, SignupData, AuthResponse };
