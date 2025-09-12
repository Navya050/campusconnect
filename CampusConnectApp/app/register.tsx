import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const router = useRouter();

  const validateFirstName = (name: string) => {
    if (!name.trim()) {
      setFirstNameError("First name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setFirstNameError("First name must be at least 2 characters");
      return false;
    }
    setFirstNameError("");
    return true;
  };

  const validateLastName = (name: string) => {
    if (!name.trim()) {
      setLastNameError("Last name is required");
      return false;
    }
    if (name.trim().length < 2) {
      setLastNameError("Last name must be at least 2 characters");
      return false;
    }
    setLastNameError("");
    return true;
  };

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
      return false;
    }
    if (!email.includes(".edu")) {
      setEmailError("Email must contain .edu");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Password is required");
      return false;
    }
    if (password.length < 9) {
      setPasswordError("Password must be at least 9 characters long");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleRegister = () => {
    const isFirstNameValid = validateFirstName(firstName);
    const isLastNameValid = validateLastName(lastName);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (
      isFirstNameValid &&
      isLastNameValid &&
      isEmailValid &&
      isPasswordValid
    ) {
      Alert.alert("Success", "Account created successfully!");
      // Navigate back to login
      router.back();
    }
  };

  const navigateToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerContainer}>
            {/* <Image
              source={{
                uri: "https://www..edu/sites/default/files/2024-10/neiu_wordmark_color_vertical.png",
                width: 120,
                height: 60,
              }}
            /> */}
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the campus community</Text>
          </View>

          <View style={styles.formContainer}>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={[
                  styles.input,
                  firstNameError ? styles.inputError : null,
                ]}
                placeholder="Enter your first name"
                placeholderTextColor="#9CA3AF"
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (firstNameError) validateFirstName(text);
                }}
                onBlur={() => validateFirstName(firstName)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {firstNameError ? (
                <Text style={styles.errorText}>{firstNameError}</Text>
              ) : null}
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={[styles.input, lastNameError ? styles.inputError : null]}
                placeholder="Enter your last name"
                placeholderTextColor="#9CA3AF"
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (lastNameError) validateLastName(text);
                }}
                onBlur={() => validateLastName(lastName)}
                autoCapitalize="words"
                autoCorrect={false}
              />
              {lastNameError ? (
                <Text style={styles.errorText}>{lastNameError}</Text>
              ) : null}
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, emailError ? styles.inputError : null]}
                placeholder="Enter your email"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) validateEmail(text);
                }}
                onBlur={() => validateEmail(email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, passwordError ? styles.inputError : null]}
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) validatePassword(text);
                }}
                onBlur={() => validatePassword(password)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              {passwordError ? (
                <Text style={styles.errorText}>{passwordError}</Text>
              ) : null}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={styles.registerButton}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Create Account</Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={navigateToLogin}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    fontSize: 14,
    color: "#EF4444",
    marginTop: 4,
  },
  registerButton: {
    backgroundColor: "#1E3A8A",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    fontSize: 16,
    color: "#6B7280",
  },
  loginLink: {
    fontSize: 16,
    color: "#1E3A8A",
    fontWeight: "600",
  },
});
