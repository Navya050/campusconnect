import { IconSymbol } from "@/components/ui/IconSymbol";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useIsAuthenticated } from "@/shared/hooks/useAuth";

export const HomePage: React.FC = () => {
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();
  const user: any = null; // Will be implemented when user data is available

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  // Show loading or redirect if not authenticated
  if (isLoading || !isAuthenticated) {
    return null;
  }

  const features = [
    {
      id: "study",
      title: "Study Space",
      description: "Find and join study groups for your courses",
      icon: "book",
      color: "#3498db",
      route: "/(tabs)/study-space",
    },
    {
      id: "shopping",
      title: "Market Place",
      description: "Buy and sell items within your campus community",
      icon: "cart",
      color: "#27ae60",
      route: "/(tabs)/Market",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>CampusConnect</Text>
          {isAuthenticated && user ? (
            <Text style={styles.welcomeText}>Welcome back, {user.name}!</Text>
          ) : (
            <Text style={styles.welcomeText}>Connect. Study. Shop.</Text>
          )}
        </View>
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Explore Spaces</Text>
        {features.map((feature) => (
          <TouchableOpacity
            key={feature.id}
            style={[styles.featureCard, { borderLeftColor: feature.color }]}
            onPress={() => router.push(feature.route as any)}
          >
            <View style={styles.featureContent}>
              <View style={styles.featureHeader}>
                <View
                  style={[
                    styles.featureIcon,
                    { backgroundColor: feature.color },
                  ]}
                >
                  <Ionicons name={feature.icon as any} size={24} color="#fff" />
                </View>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={20} color="#bdc3c7" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.aboutContainer}>
        <Text style={styles.sectionTitle}>About CampusConnect</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutText}>
            CampusConnect is your university&apos;s digital hub for academic
            collaboration and campus commerce. Connect with fellow students,
            join study groups, and discover a marketplace tailored for your
            campus community.
          </Text>
          <View style={styles.aboutFeatures}>
            <View style={styles.aboutFeature}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={16}
                color="#27ae60"
              />
              <Text style={styles.aboutFeatureText}>
                University-verified platform
              </Text>
            </View>
            <View style={styles.aboutFeature}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={16}
                color="#27ae60"
              />
              <Text style={styles.aboutFeatureText}>
                Safe campus-only network
              </Text>
            </View>
            <View style={styles.aboutFeature}>
              <IconSymbol
                name="checkmark.circle.fill"
                size={16}
                color="#27ae60"
              />
              <Text style={styles.aboutFeatureText}>
                Academic support groups
              </Text>
            </View>
          </View>
        </View>
      </View>

      {!isAuthenticated && (
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaTitle}>Ready to get started?</Text>
          <Text style={styles.ctaSubtitle}>
            Join your campus community today and discover new ways to learn and
            connect.
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.ctaButtonText}>Join CampusConnect</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  welcomeText: {
    fontSize: 16,
    color: "#7f8c8d",
    marginTop: 4,
  },
  loginButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
    textAlign: "center",
    marginTop: 4,
  },
  featuresContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  featureCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  featureContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: "#7f8c8d",
    lineHeight: 20,
  },
  activityContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  activityTime: {
    fontSize: 12,
    color: "#7f8c8d",
    marginTop: 2,
  },
  aboutContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 8,
  },
  aboutCard: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
  },
  aboutText: {
    fontSize: 14,
    color: "#2c3e50",
    lineHeight: 22,
    marginBottom: 16,
  },
  aboutFeatures: {
    gap: 8,
  },
  aboutFeature: {
    flexDirection: "row",
    alignItems: "center",
  },
  aboutFeatureText: {
    fontSize: 14,
    color: "#2c3e50",
    marginLeft: 8,
  },
  ctaContainer: {
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: "#3498db",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
