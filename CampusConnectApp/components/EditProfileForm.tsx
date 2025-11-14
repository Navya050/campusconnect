import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Card,
  Title,
  HelperText,
  ActivityIndicator,
  Menu,
  TouchableRipple,
  Appbar,
} from "react-native-paper";
import { Colors } from "@/constants/theme";
import storage from "@/shared/utils/storage";

interface EditProfileFormProps {
  currentUser: any;
  onSave: (updatedUser: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: string;
  educationLevel: string;
  category: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  graduationYear?: string;
  educationLevel?: string;
  category?: string;
}

const educationLevels = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD",
  "Other",
];

const categories = [
  "Computer Science",
  "Engineering",
  "Business",
  "Medicine",
  "Arts",
  "Science",
  "Mathematics",
  "Literature",
  "History",
  "Psychology",
  "Other",
];

const graduationYears = Array.from({ length: 10 }, (_, i) => {
  const year = new Date().getFullYear() + i;
  return year.toString();
});

export const EditProfileForm: React.FC<EditProfileFormProps> = ({
  currentUser,
  onSave,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
    graduationYear: currentUser?.graduationYear || "",
    educationLevel: currentUser?.educationLevel || "",
    category: currentUser?.category || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Graduation Year validation
    if (!formData.graduationYear) {
      newErrors.graduationYear = "Graduation year is required";
    }

    // Education Level validation
    if (!formData.educationLevel) {
      newErrors.educationLevel = "Education level is required";
    }

    // Category validation
    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await storage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.177:3406/api"
        }/user/profile/${currentUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {
        // Update stored user data
        await storage.setItem("userData", JSON.stringify(result.user));

        Alert.alert("Success", "Profile updated successfully!", [
          {
            text: "OK",
            onPress: () => onSave(result.user),
          },
        ]);
      } else {
        Alert.alert("Error", result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={onCancel} />
        <Appbar.Content title="Edit Profile" />
      </Appbar.Header>
      <ScrollView style={styles.scrollView}>
        <Card style={styles.formCard}>
          <Card.Content>
            {/* First Name */}
            <View style={styles.inputContainer}>
              <TextInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => handleInputChange("firstName", text)}
                mode="outlined"
                style={styles.input}
                textColor="#000000"
                error={!!errors.firstName}
                disabled={isSubmitting}
              />
              <HelperText type="error" visible={!!errors.firstName}>
                {errors.firstName}
              </HelperText>
            </View>

            {/* Last Name */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => handleInputChange("lastName", text)}
                mode="outlined"
                style={styles.input}
                textColor="#000000"
                error={!!errors.lastName}
                disabled={isSubmitting}
              />
              <HelperText type="error" visible={!!errors.lastName}>
                {errors.lastName}
              </HelperText>
            </View>

            {/* Email */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Email"
                value={formData.email}
                onChangeText={(text) => handleInputChange("email", text)}
                mode="outlined"
                style={styles.input}
                textColor="#000000"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.email}
                disabled={isSubmitting}
              />
              <HelperText type="error" visible={!!errors.email}>
                {errors.email}
              </HelperText>
            </View>

            {/* Education Level */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Education Level"
                value={formData.educationLevel}
                mode="outlined"
                style={styles.input}
                textColor="#000000"
                error={!!errors.educationLevel}
                disabled={isSubmitting}
                editable={false}
                right={<TextInput.Icon icon="chevron-down" />}
                onPressIn={() => {
                  Alert.alert("Select Education Level", "", [
                    ...educationLevels.map((level) => ({
                      text: level,
                      onPress: () => handleInputChange("educationLevel", level),
                    })),
                    { text: "Cancel", style: "cancel" as const },
                  ]);
                }}
              />
              <HelperText type="error" visible={!!errors.educationLevel}>
                {errors.educationLevel}
              </HelperText>
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Category"
                value={formData.category}
                mode="outlined"
                style={styles.input}
                textColor="#000000"
                error={!!errors.category}
                disabled={isSubmitting}
                editable={false}
                right={<TextInput.Icon icon="chevron-down" />}
                onPressIn={() => {
                  Alert.alert("Select Category", "", [
                    ...categories.map((cat) => ({
                      text: cat,
                      onPress: () => handleInputChange("category", cat),
                    })),
                    { text: "Cancel", style: "cancel" as const },
                  ]);
                }}
              />
              <HelperText type="error" visible={!!errors.category}>
                {errors.category}
              </HelperText>
            </View>

            {/* Graduation Year */}
            <View style={styles.inputContainer}>
              <TextInput
                label="Graduation Year"
                value={formData.graduationYear}
                mode="outlined"
                style={styles.input}
                textColor="#000000"
                error={!!errors.graduationYear}
                disabled={isSubmitting}
                editable={false}
                right={<TextInput.Icon icon="chevron-down" />}
                onPressIn={() => {
                  Alert.alert("Select Graduation Year", "", [
                    ...graduationYears.map((year) => ({
                      text: year,
                      onPress: () => handleInputChange("graduationYear", year),
                    })),
                    { text: "Cancel", style: "cancel" as const },
                  ]);
                }}
              />
              <HelperText type="error" visible={!!errors.graduationYear}>
                {errors.graduationYear}
              </HelperText>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onCancel}
                style={styles.cancelButton}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.saveButton}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: 16,
    backgroundColor: "white",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "white",
    color: "black",
  },
  pickerLabel: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 8,
    fontWeight: "500",
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 4,
    backgroundColor: "white",
  },
  pickerError: {
    borderColor: "#d32f2f",
  },
  picker: {
    height: 50,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
});
