import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Title, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useLogout, useIsAuthenticated } from "@/shared/hooks/useAuth";
import alert from "../shared/utils/alert";

export const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  const handleLogout = async () => {
    alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logoutMutation.mutate(undefined, {
            onSuccess: () => {
              // The AuthGuard will handle the redirect automatically
              console.log("Logout successful");
            },
            onError: (error) => {
              console.error("Error during logout:", error);
              alert.alert("Error", "Failed to logout. Please try again.");
            },
          });
        },
      },
    ]);
  };

  // Show loading or redirect if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Title style={styles.message}>Welcome to Profile</Title>
      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#FF5722"
        // icon="log-out-outline"
      >
        Logout
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  message: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#9C27B0",
    marginBottom: 30,
  },
  logoutButton: {
    width: 200,
  },
});
