import { Platform } from "react-native";

/**
 * Environment Configuration
 *
 * Cross-platform environment management for Expo apps
 * - Mobile: Uses EXPO_PUBLIC_ variables from .env
 * - Web: Uses EXPO_PUBLIC_ variables from .env
 * - Handles localhost vs network IP automatically
 */

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  // If EXPO_PUBLIC_API_URL is set, use it but handle platform-specific modifications
  if (envUrl) {
    // On web, replace any IP address with localhost
    if (Platform.OS === "web") {
      return envUrl.replace(/http:\/\/[\d.]+:(\d+)/, "http://localhost:$1");
    }
    return envUrl;
  }

  // Default URLs based on platform
  if (Platform.OS === "web") {
    return "http://localhost:3406/api";
  } else {
    // For mobile devices, localhost won't work - need actual IP
    // You can override this by setting EXPO_PUBLIC_API_URL in .env
    return "http://172.17.151.175:3406/api";
  }
};

export const config = {
  // API Configuration
  API_URL: getApiUrl(),

  // App Environment
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || "development",

  // Platform info
  platform: Platform.OS,
  isWeb: Platform.OS === "web",
  isMobile: Platform.OS === "ios" || Platform.OS === "android",

  // Development helpers
  isDevelopment:
    (process.env.EXPO_PUBLIC_APP_ENV || "development") === "development",
  isProduction: process.env.EXPO_PUBLIC_APP_ENV === "production",
} as const;

// Log configuration in development
if (config.isDevelopment) {
  console.log("Environment Config:", {
    API_URL: config.API_URL,
    APP_ENV: config.APP_ENV,
    Platform: config.platform,
  });
}
