import React, { useState, useEffect } from "react";
import { View, Alert, StyleSheet } from "react-native";
import { TextInput, Button, Card, Title, useTheme } from "react-native-paper";
import { useRouter } from "expo-router";
import { useAppDispatch, useAppSelector } from "../../../shared/hooks";
import { loginUser, clearError } from "../store/authSlice";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const theme = useTheme();

  useEffect(() => {
    if (isAuthenticated) router.replace("/(tabs)");
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      Alert.alert("Error", error);
      dispatch(clearError());
    }
  }, [error]);

  const handleLogin = () => {
    if (email && password) {
      dispatch(loginUser({ email, password }));
    }
  };

  const dynamicStyles = createStyles(theme);

  return (
    <View style={dynamicStyles.container}>
      <Card style={dynamicStyles.card}>
        <Card.Content>
          <Title style={dynamicStyles.title}>Welcome Back</Title>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={dynamicStyles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={dynamicStyles.input}
          />

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={!email || !password || isLoading}
            style={dynamicStyles.button}
          >
            Sign In
          </Button>

          <Button
            mode="text"
            onPress={() => router.push("/register")}
            style={dynamicStyles.textButton}
          >
            Don't have an account? Sign Up
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  card: {
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    color: theme.colors.onSurface,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 16,
    marginBottom: 8,
  },
  textButton: {
    marginTop: 8,
  },
});