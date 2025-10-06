import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Platform-agnostic storage utility
 * Uses localStorage on web and AsyncStorage on native platforms
 */
const storage = {
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  },

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  },

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === "web") {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    if (Platform.OS === "web") {
      keys.forEach((key) => localStorage.removeItem(key));
    } else {
      await AsyncStorage.multiRemove(keys);
    }
  },
};

export default storage;
