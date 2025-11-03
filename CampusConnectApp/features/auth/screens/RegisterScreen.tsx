import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { TextInput, Button, Card, Title } from "react-native-paper";
import { Dropdown } from "react-native-paper-dropdown";
import { useRouter } from "expo-router";
import { useSignup } from "@/shared/hooks/useAuth";
import alert from "../../../shared/utils/alert";

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [educationLevel, setEducationLevel] = useState("");
  const [category, setCategory] = useState("");
  const [graduationYear, setGraduationYear] = useState("");

  const router = useRouter();
  const signupMutation = useSignup();

  const graduationYearOptions = Array.from({ length: 16 }, (_, i) => {
    const year = 2020 + i;
    return { label: `${year}`, value: `${year}` };
  });

  const educationOptions = [
    { label: "Undergraduate (UG)", value: "UG" },
    { label: "Postgraduate (PG)", value: "PG" },
  ];

  const categoryOptions = [
    { label: "CSE", value: "CSE" },
    { label: "AIML", value: "AIML" },
    { label: "Finance", value: "FINANCE" },
    { label: "ECE", value: "ECE" },
    { label: "Mechanical", value: "MECHANICAL" },
    { label: "Civil", value: "CIVIL" },
  ];

  const handleRegister = async () => {
    if (
      firstName &&
      lastName &&
      email &&
      password &&
      educationLevel &&
      category &&
      graduationYear
    ) {
      signupMutation.mutate(
        {
          firstName,
          lastName,
          email,
          password,
          educationLevel,
          category,
          graduationYear,
        },
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
    } else {
      alert.alert("Missing Info", "Please fill out all the fields.");
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

          <View style={styles.input}>
            <Dropdown
              label="Education Level"
              placeholder="Select education level"
              options={educationOptions}
              value={educationLevel}
              onSelect={(value) => setEducationLevel(value || "")}
              mode="outlined"
            />
          </View>

          <View style={styles.input}>
            <Dropdown
              label="Category / Department"
              placeholder="Select category"
              options={categoryOptions}
              value={category}
              onSelect={(value) => setCategory(value || "")}
              mode="outlined"
            />
          </View>

          <View style={styles.input}>
            <Dropdown
              label="Graduation Year"
              placeholder="Select year"
              options={graduationYearOptions}
              value={graduationYear}
              onSelect={(value) => setGraduationYear(value || "")}
              mode="outlined"
            />
          </View>

          <Button
            mode="contained"
            onPress={handleRegister}
            loading={signupMutation.isPending}
            disabled={
              !firstName ||
              !lastName ||
              !email ||
              !password ||
              !educationLevel ||
              !category ||
              !graduationYear ||
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
