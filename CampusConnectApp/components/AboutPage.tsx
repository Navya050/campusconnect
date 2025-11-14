import React from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Appbar,
  Divider,
  Surface,
} from "react-native-paper";
import { Colors } from "@/constants/theme";
import { MaterialIcons } from "@expo/vector-icons";

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Appbar.Header>
        <Appbar.BackAction onPress={onBack} />
        <Appbar.Content title="About" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* App Info Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.appIconContainer}>
              <View style={styles.appIcon}>
                <MaterialIcons name="school" size={48} color="white" />
              </View>
              <Title style={styles.appTitle}>Campus Connect</Title>
              <Text style={styles.version}>Version 1.0</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Description Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>About the App</Title>
            <Paragraph style={styles.description}>
              Campus Connect is a comprehensive platform designed for students
              to connect, share resources, and collaborate in study groups with
              real-time chat functionality.
            </Paragraph>
            <Paragraph style={styles.description}>Features include:</Paragraph>
            <View style={styles.featuresList}>
              <Text style={styles.featureItem}>
                • Real-time group chat with media sharing
              </Text>
              <Text style={styles.featureItem}>
                • Study group creation and management
              </Text>
              <Text style={styles.featureItem}>
                • Resource sharing marketplace
              </Text>
              <Text style={styles.featureItem}>• User profile management</Text>
              <Text style={styles.featureItem}>
                • Secure authentication system
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
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
  card: {
    margin: 16,
    marginBottom: 8,
    backgroundColor: "white",
  },
  appIconContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 4,
  },
  version: {
    fontSize: 16,
    color: Colors.light.icon,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 12,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    fontSize: 15,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 4,
  },
  developerInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  developerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.light.tint + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  developerText: {
    flex: 1,
  },
  developerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 2,
  },
  developerRole: {
    fontSize: 14,
    color: Colors.light.tint,
    marginBottom: 2,
  },
  developerTarget: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  techInfo: {
    gap: 12,
  },
  techItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  techLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
  },
  techValue: {
    fontSize: 16,
    color: Colors.light.icon,
    flex: 2,
    textAlign: "right",
  },
  copyright: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.light.icon,
    textAlign: "center",
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 20,
  },
});
