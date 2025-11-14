import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Surface,
  ActivityIndicator,
  Chip,
  Menu,
  IconButton,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useIsAuthenticated } from "@/shared/hooks/useAuth";
import {
  useStudyGroups,
  useJoinStudyGroup,
  StudyGroup,
  useLeaveStudyGroup,
} from "@/shared/hooks/useStudyGroups";
import { Colors } from "../constants/theme";
import storage from "@/shared/utils/storage";
import { Chat } from "@/components/chat/Chat";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  graduationYear: string;
  educationLevel: string;
  category: string;
}

interface StudyLevel {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
}

const getStudyLevels = (userEducationLevel: string): StudyLevel[] => {
  if (userEducationLevel === "UG") {
    return [
      {
        id: "UG",
        title: "Undergraduate",
        description: "Bachelor's degree programs and courses",
        icon: "school",
        color: "#4CAF50",
      },
    ];
  } else if (userEducationLevel === "PG") {
    return [
      {
        id: "PG",
        title: "Postgraduate",
        description: "Master's and PhD programs",
        icon: "psychology",
        color: "#2196F3",
      },
    ];
  }
  return [];
};

export const StudySpacePage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const router = useRouter();
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  const joinGroupMutation = useJoinStudyGroup();
  const leaveGroupMutation = useLeaveStudyGroup();

  // Get user data from storage
  useEffect(() => {
    const getUserData = async () => {
      try {
        const userData = await storage.getItem("userData");
        console.log("Raw userData from storage:", userData);
        console.log("Type of userData:", typeof userData);

        if (userData) {
          let parsedUser;

          if (typeof userData === "string") {
            try {
              parsedUser = JSON.parse(userData);
            } catch (parseError) {
              console.error("Error parsing userData JSON:", parseError);
              console.log("userData content:", userData);
              return;
            }
          } else if (typeof userData === "object" && userData !== null) {
            parsedUser = userData;
          } else {
            console.error("Invalid userData type:", typeof userData);
            return;
          }

          console.log("Parsed user:", parsedUser);
          setUser(parsedUser);
          // Auto-select the user's education level
          if (parsedUser.educationLevel) {
            setSelectedLevel(parsedUser.educationLevel);
          }
        }
      } catch (error) {
        console.error("Error getting user data:", error);
      }
    };
    getUserData();
  }, []);

  // Fetch groups based on user's education level
  const {
    data: groups,
    isLoading: groupsLoading,
    error: groupsError,
  } = useStudyGroups({
    educationLevel: user?.educationLevel,
    category: user?.category,
    graduationYear: user?.graduationYear,
    userId: user?._id,
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  const handleLevelSelect = (levelId: string) => {
    setSelectedLevel(levelId);
  };

  const handleJoinGroup = async (group: StudyGroup) => {
    if (!user) return;

    try {
      await joinGroupMutation.mutateAsync({
        groupId: group._id,
        userId: user._id,
      });
      Alert.alert("Success", `Successfully joined ${group.name}!`);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join group");
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;

    try {
      await leaveGroupMutation.mutateAsync({
        groupId: selectedGroup?._id,
        userId: user._id,
      });
      Alert.alert("Success", `Successfully left ${selectedGroup?.name}!`);
      setSelectedGroup(null);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to leave group");
    }
  };

  const handleViewGroup = (group: StudyGroup) => {
    setSelectedGroup(group);
  };

  // Show loading or redirect if not authenticated
  if (isLoading || !isAuthenticated || !user) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const studyLevels = getStudyLevels(user.educationLevel);

  const renderGroupCard = (group: StudyGroup) => (
    <Card key={group._id} style={styles.groupCard}>
      <Card.Content>
        <View style={styles.groupHeader}>
          <Title style={styles.groupTitle}>{group.name}</Title>
          <View style={styles.groupStats}>
            {group.isJoined && (
              <Chip mode="flat" style={styles.joinedChip} compact>
                Joined
              </Chip>
            )}
          </View>
        </View>

        <Paragraph style={styles.groupDescription}>
          {group.description}
        </Paragraph>

        <View style={styles.groupDetails}>
          <Text style={styles.groupDetailText}>Category: {group.category}</Text>
          <Text style={styles.groupDetailText}>
            Year: {group.graduationYear}
          </Text>
        </View>

        <View style={styles.groupActions}>
          {group.isJoined ? (
            <Button
              mode="contained"
              onPress={() => handleViewGroup(group)}
              style={styles.viewButton}
            >
              View Group
            </Button>
          ) : (
            <Button
              mode="contained"
              onPress={() => handleJoinGroup(group)}
              disabled={group.isFull || joinGroupMutation.isPending}
              style={styles.joinButton}
            >
              {group.isFull ? "Full" : "Join Group"}
            </Button>
          )}
        </View>
      </Card.Content>
    </Card>
  );

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

    if (groupsLoading) {
      return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={level.color} />
          <Text style={styles.loadingText}>Loading study groups...</Text>
        </View>
      );
    }

    if (groupsError) {
      return (
        <View style={styles.screenContainer}>
          <Card style={styles.errorCard}>
            <Card.Content>
              <Title style={styles.errorTitle}>Error Loading Groups</Title>
              <Paragraph>
                Failed to load study groups. Please try again.
              </Paragraph>
            </Card.Content>
          </Card>
          <Button
            mode="outlined"
            onPress={() => setSelectedLevel(null)}
            style={styles.backButton}
            icon="arrow-left"
          >
            Back to Study Levels
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.screenContainer}>
        <Card style={styles.screenCard}>
          <Card.Content>
            <View style={styles.screenHeader}>
              <MaterialIcons name={level.icon} size={60} color={level.color} />
              <Title style={[styles.screenTitle, { color: level.color }]}>
                {level.title} Study Groups
              </Title>
            </View>
            <Paragraph style={styles.screenDescription}>
              Join study groups for your {level.title.toLowerCase()} program in{" "}
              {user.category}.
            </Paragraph>
          </Card.Content>
        </Card>

        <View style={styles.groupsContainer}>
          {groups && groups.length > 0 ? (
            groups.map(renderGroupCard)
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Title style={styles.emptyTitle}>No Groups Available</Title>
                <Paragraph>
                  No study groups found for your program. Check back later or
                  contact your administrator.
                </Paragraph>
              </Card.Content>
            </Card>
          )}
        </View>

        <Button
          mode="outlined"
          onPress={() => setSelectedLevel(null)}
          style={styles.backButton}
          icon="arrow-left"
        >
          Back to Study Levels
        </Button>
      </View>
    );
  };

  const renderGroupView = () => {
    if (!selectedGroup) return null;

    return (
      <View style={styles.container}>
        {/* Chat Header */}
        <Surface style={styles.chatHeader} elevation={2}>
          <View style={styles.chatHeaderContent}>
            <IconButton
              icon="arrow-left"
              size={24}
              onPress={() => setSelectedGroup(null)}
              style={styles.headerBackButton}
            />
            <View style={styles.chatHeaderInfo}>
              <Title style={styles.chatHeaderTitle}>{selectedGroup.name}</Title>
              <Text style={styles.chatHeaderSubtitle}>
                {selectedGroup.category} • {selectedGroup.graduationYear}
              </Text>
            </View>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <IconButton
                  icon="dots-vertical"
                  size={24}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              <Menu.Item
                onPress={() => {
                  setMenuVisible(false);
                  handleLeaveGroup();
                }}
                title="Leave Group"
                leadingIcon="exit-to-app"
              />
            </Menu>
          </View>
        </Surface>

        {/* Chat Content */}
        <View style={styles.chatContainer}>
          <Chat groupId={selectedGroup._id} currentUserId={user._id} />
        </View>
      </View>
    );
  };

  if (selectedGroup) {
    return renderGroupView();
  }

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
          Welcome {user.firstName}! Access your{" "}
          {user.educationLevel === "UG" ? "Undergraduate" : "Postgraduate"}{" "}
          study groups
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
              • Access to study groups and chat
            </Text>
            <Text style={styles.featureItem}>
              • Connect with peers in your program
            </Text>
            <Text style={styles.featureItem}>
              • Real-time messaging with Socket.IO
            </Text>
            <Text style={styles.featureItem}>
              • Collaborate on study materials
            </Text>
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.icon,
  },
  errorCard: {
    marginBottom: 20,
    backgroundColor: "white",
  },
  errorTitle: {
    color: "#d32f2f",
    textAlign: "center",
  },
  groupsContainer: {
    gap: 12,
  },
  groupCard: {
    backgroundColor: "white",
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  groupStats: {
    flexDirection: "row",
    gap: 8,
  },
  joinedChip: {
    backgroundColor: "#30d830ff",
  },
  groupDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 12,
    lineHeight: 20,
  },
  groupDetails: {
    marginBottom: 16,
  },
  groupDetailText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  groupActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  groupActionsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "white",
    marginTop: 16,
  },
  backToGroupsButton: {
    flex: 1,
    marginRight: 8,
  },
  leaveGroupButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#d32f2f",
  },
  joinButton: {
    backgroundColor: Colors.light.tint,
  },
  viewButton: {
    backgroundColor: "#4CAF50",
  },
  emptyCard: {
    backgroundColor: "white",
    marginBottom: 20,
  },
  emptyTitle: {
    textAlign: "center",
    color: Colors.light.icon,
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
  // Chat styles
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    backgroundColor: "white",
    paddingVertical: 8,
  },
  chatHeaderContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: 8,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  chatHeaderSubtitle: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 2,
  },
  headerBackButton: {
    margin: 0,
  },
  comingSoonContainer: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "white",
    margin: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginTop: 16,
    textAlign: "center",
  },
  comingSoonDescription: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 24,
  },
});
