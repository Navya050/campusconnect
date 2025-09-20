import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useColorScheme } from "react-native"; // ✅ use from react-native in SDK 54
import "react-native-reanimated";
import { useEffect, useState } from "react";
import authService from "@/services/authService";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      return authenticated;
    } catch (error) {
      console.error("Error checking auth status:", error);
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    // Re-check auth status when segments change (after navigation)
    if (segments.length > 0) {
      checkAuthStatus();
    }
  }, [segments]);

  // Add interval to periodically check auth status for logout detection
  useEffect(() => {
    const interval = setInterval(() => {
      checkAuthStatus();
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return; // Still loading

    const inAuthGroup = segments[0] === "(tabs)";

    if (isAuthenticated && !inAuthGroup) {
      // User is authenticated but not in protected area, redirect to tabs
      router.replace("/(tabs)");
    } else if (!isAuthenticated && inAuthGroup) {
      // User is not authenticated but in protected area, redirect to login
      router.replace("/login");
    }
  }, [isAuthenticated, segments]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </ThemeProvider>
  );
}
