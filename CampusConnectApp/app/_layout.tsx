import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { Provider } from "react-redux";
import { PaperProvider } from "react-native-paper";
import { store } from "../shared/store";
import { getTheme } from "../shared/theme";
import { QueryProvider } from "../shared/providers/QueryProvider";
import { AuthGuard } from "../components/AuthGuard";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === "dark");

  return (
    <Provider store={store}>
      <QueryProvider>
        <PaperProvider theme={theme}>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="login" />
              <Stack.Screen name="register" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </AuthGuard>
        </PaperProvider>
      </QueryProvider>
    </Provider>
  );
}
