import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { config } from "../../../shared/config/environment";

const API_URL = config.API_URL;

// Simple auth API
export const authAPI = {
  async login(email: string, password: string) {
    console.log("testing");
    const response = await axios.post(`${API_URL}/user/login`, { email, password });
    const { token, expiresIn } = response.data;

    // Store token
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("tokenExpiry", (Date.now() + expiresIn * 1000).toString());

    return response.data;
  },

  async signup(userData: { firstName: string; lastName: string; email: string; password: string }) {
    const response = await axios.post(`${API_URL}/user/signup`, userData);
    return response.data;
  },

  async logout() {
    await AsyncStorage.multiRemove(["token", "tokenExpiry"]);
  },

  async getToken() {
    const token = await AsyncStorage.getItem("token");
    const expiry = await AsyncStorage.getItem("tokenExpiry");

    if (token && expiry && Date.now() < parseInt(expiry)) {
      return token;
    }

    await this.logout();
    return null;
  },

  async isAuthenticated() {
    return (await this.getToken()) !== null;
  }
};