import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "user_data";

export interface AuthData {
  token: string;
  expiresIn: number;
  success: boolean;
}

export interface UserData {
  email: string;
  // Add other user fields as needed
}

class AuthService {
  // Store token and user data
  async storeAuthData(authData: AuthData, userData?: UserData): Promise<void> {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, authData.token);
      if (userData) {
        await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      }
      // Store expiration time
      const expirationTime = Date.now() + authData.expiresIn * 1000;
      await AsyncStorage.setItem("token_expiration", expirationTime.toString());
    } catch (error) {
      console.error("Error storing auth data:", error);
      throw error;
    }
  }

  // Get stored token
  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);
      const expirationTime = await AsyncStorage.getItem("token_expiration");

      if (token && expirationTime) {
        const now = Date.now();
        const expiration = parseInt(expirationTime);

        if (now < expiration) {
          return token;
        } else {
          // Token expired, clear it
          await this.clearAuthData();
          return null;
        }
      }

      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  // Get stored user data
  async getUserData(): Promise<UserData | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }

  // Clear all auth data (logout)
  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, "token_expiration"]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  }

  // Get authorization header for API calls
  async getAuthHeader(): Promise<{ Authorization: string } | {}> {
    const token = await this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export default new AuthService();
