import React from "react";
import { View, StyleSheet } from "react-native";
import { Title, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useLogout } from "@/shared/hooks/useAuth";
import alert from "../shared/utils/alert";

export const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const logoutMutation = useLogout();

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
              router.replace("/login");
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
