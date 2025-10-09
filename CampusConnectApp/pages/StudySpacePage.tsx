import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from "react-native";
import { Card, Title, Paragraph, Button, Surface } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

interface StudyLevel {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const studyLevels: StudyLevel[] = [
  {
    id: "undergraduate",
    title: "Undergraduate",
    description: "Bachelor's degree programs and courses",
    icon: "school",
    color: "#4CAF50",
  },
  {
    id: "graduate",
    title: "Graduate",
    description: "Master's and PhD programs",
    icon: "psychology",
    color: "#2196F3",
  },
];

export const StudySpacePage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
  };

  const renderLevelCard = (level: StudyLevel) => (
    <TouchableOpacity
      key={level.id}
      onPress={() => handleLevelSelect(level.id)}
      style={styles.levelCardContainer}
    >
      <Surface
        style={[styles.levelCard, { borderColor: level.color }]}
        elevation={2}
      >
        <View style={[styles.iconContainer, { backgroundColor: level.color }]}>
          <MaterialIcons name={level.icon} size={40} color="white" />
        </View>
        <View style={styles.levelContent}>
          <Title style={styles.levelTitle}>{level.title}</Title>
          <Paragraph style={styles.levelDescription}>
            {level.description}
          </Paragraph>
        </View>
        <MaterialIcons name="arrow-forward-ios" size={20} color={level.color} />
      </Surface>
    </TouchableOpacity>
  );

  const renderSelectedScreen = () => {
    const level = studyLevels.find((l) => l.id === selectedLevel);
    if (!level) return null;

    return (
      <View style={styles.screenContainer}>
        <Card style={styles.screenCard}>
          <Card.Content>
            <View style={styles.screenHeader}>
              <MaterialIcons name={level.icon} size={60} color={level.color} />
              <Title style={[styles.screenTitle, { color: level.color }]}>
                {level.title} Screen
              </Title>
            </View>
            <Paragraph style={styles.screenDescription}>
              Welcome to the {level.title} study space. This is where
              you&apos;ll find all resources and tools specifically designed for{" "}
              {level.title.toLowerCase()} students.
            </Paragraph>
          </Card.Content>
        </Card>

        <Button
          mode="outlined"
          onPress={() => setSelectedLevel(null)}
          style={styles.backButton}
          icon="arrow-back"
        >
          Back to Study Levels
        </Button>
      </View>
    );
  };

  if (selectedLevel) {
    return (
      <ScrollView style={styles.container}>{renderSelectedScreen()}</ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons
          name="library-books"
          size={40}
          color={Colors.light.tint}
        />
        <Title style={styles.headerTitle}>Study Space</Title>
        <Paragraph style={styles.headerSubtitle}>
          Choose your academic level to access tailored study resources
        </Paragraph>
      </View>

      <View style={styles.levelsContainer}>
        {studyLevels.map(renderLevelCard)}
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoHeader}>
            <MaterialIcons name="info" size={24} color={Colors.light.tint} />
            <Text style={styles.infoTitle}>Study Space Features</Text>
          </View>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>
              • Access to study groups and materials
            </Text>
            <Text style={styles.featureItem}>
              • Connect with peers in your program
            </Text>
            <Text style={styles.featureItem}>• Share notes and resources</Text>
            <Text style={styles.featureItem}>• Schedule study sessions</Text>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "white",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: "center",
    marginTop: 4,
  },
  levelsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  levelCardContainer: {
    marginBottom: 8,
  },
  levelCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
    borderWidth: 2,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  levelContent: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: Colors.light.icon,
  },
  screenContainer: {
    padding: 16,
  },
  screenCard: {
    marginBottom: 20,
    backgroundColor: "white",
  },
  screenHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },
  screenDescription: {
    fontSize: 16,
    textAlign: "center",
    color: Colors.light.icon,
    lineHeight: 24,
  },
  backButton: {
    marginTop: 16,
  },
  infoCard: {
    margin: 16,
    backgroundColor: "white",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: Colors.light.text,
  },
  featuresList: {
    paddingLeft: 8,
  },
  featureItem: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 6,
    lineHeight: 20,
  },
});
