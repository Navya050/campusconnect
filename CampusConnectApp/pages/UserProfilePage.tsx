import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Text,
} from "react-native";
import {
  Title,
  Button,
  Card,
  Divider,
  Avatar,
  Surface,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useLogout, useIsAuthenticated } from "@/shared/hooks/useAuth";
import { Colors } from "@/constants/theme";
import storage from "@/shared/utils/storage";
import alert from "../shared/utils/alert";
import { EditProfileForm } from "@/components/EditProfileForm";
import { AboutPage } from "@/components/AboutPage";

interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  onPress: () => void;
  color?: string;
  showArrow?: boolean;
}

export const UserProfilePage: React.FC = () => {
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Get current user data
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await storage.getItem("userData");
        if (userData) {
          const parsedUser =
            typeof userData === "string" ? JSON.parse(userData) : userData;
          setCurrentUser(parsedUser);
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      } finally {
        setUserLoading(false);
      }
    };
    getUserData();
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleSaveProfile = (updatedUser: any) => {
    setCurrentUser(updatedUser);
    setShowEditProfile(false);
  };

  const handleCancelEdit = () => {
    setShowEditProfile(false);
  };

  const handleAboutApp = () => {
    setShowAbout(true);
  };

  const handleBackFromAbout = () => {
    setShowAbout(false);
  };

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

  const profileOptions: ProfileOption[] = [
    {
      id: "edit-profile",
      title: "Edit Profile",
      subtitle: "Update your personal information",
      icon: "edit",
      onPress: handleEditProfile,
      color: Colors.light.tint,
      showArrow: true,
    },
    {
      id: "about",
      title: "About",
      subtitle: "App version and information",
      icon: "info",
      onPress: handleAboutApp,
      color: "#607D8B",
      showArrow: true,
    },
  ];

  // Show loading or redirect if not authenticated
  if (isLoading || !isAuthenticated || userLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Show edit profile form
  if (showEditProfile) {
    return (
      <EditProfileForm
        currentUser={currentUser}
        onSave={handleSaveProfile}
        onCancel={handleCancelEdit}
      />
    );
  }

  // Show about page
  if (showAbout) {
    return <AboutPage onBack={handleBackFromAbout} />;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.profileHeader} elevation={2}>
        <View style={styles.profileInfo}>
          <Avatar.Text
            size={80}
            label={currentUser?.firstName?.charAt(0)?.toUpperCase() || "U"}
            style={styles.avatar}
            labelStyle={styles.avatarLabel}
          />
          <View style={styles.userInfo}>
            <Title style={styles.userName}>
              {currentUser?.firstName && currentUser?.lastName
                ? `${currentUser.firstName} ${currentUser.lastName}`
                : "User"}
            </Title>
            <Text style={styles.userEmail}>
              {currentUser?.email || "user@example.com"}
            </Text>
            <Text style={styles.userRole}>
              {currentUser?.role || "Student"}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Profile Options */}
      <View style={styles.optionsContainer}>
        {profileOptions.map((option, index) => (
          <View key={option.id}>
            <TouchableOpacity
              style={styles.optionItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.optionLeft}>
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: option.color + "20" },
                  ]}
                >
                  <MaterialIcons
                    name={option.icon as any}
                    size={24}
                    color={option.color}
                  />
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  {option.subtitle && (
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  )}
                </View>
              </View>
              {option.showArrow && (
                <MaterialIcons
                  name="chevron-right"
                  size={24}
                  color={Colors.light.icon}
                />
              )}
            </TouchableOpacity>
            {index < profileOptions.length - 1 && (
              <Divider style={styles.divider} />
            )}
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          buttonColor="#FF5722"
          icon="logout"
          loading={logoutMutation.isPending}
          disabled={logoutMutation.isPending}
        >
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Campus Connect v1.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.icon,
  },
  profileHeader: {
    backgroundColor: "white",
    padding: 24,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    backgroundColor: Colors.light.tint,
    marginRight: 20,
  },
  avatarLabel: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "500",
  },
  optionsContainer: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  divider: {
    marginLeft: 80,
  },
  logoutContainer: {
    padding: 24,
    alignItems: "center",
  },
  logoutButton: {
    width: "80%",
    paddingVertical: 4,
  },
  versionContainer: {
    alignItems: "center",
    paddingBottom: 24,
  },
  versionText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
});
