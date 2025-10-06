import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { useRouter } from "expo-router";
import { useSignup } from "@/shared/hooks/useAuth";
import alert from "../../../shared/utils/alert";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const signupMutation = useSignup();

  const handleRegister = async () => {
    if (firstName && lastName && email && password) {
      signupMutation.mutate(
        { firstName, lastName, email, password },
        {
          onSuccess: () => {
            alert.alert("Success", "Account created successfully!");
            router.back();
          },
          onError: (error) => {
            alert.alert("Error", error.message || "Registration failed");
          },
        }
      );
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Create Account</Title>

          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            mode="outlined"
            style={styles.input}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={signupMutation.isPending}
            disabled={
              !firstName ||
              !lastName ||
              !email ||
              !password ||
              signupMutation.isPending
            }
            style={styles.button}
          >
            Create Account
          </Button>

          <Button
            mode="text"
            onPress={() => router.push("/login")}
            style={styles.textButton}
          >
            Already have an account? Sign In
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
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
