import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Dimensions,
  Modal,
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
  Searchbar,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useIsAuthenticated } from "@/shared/hooks/useAuth";
import {
  useStudyGroups,
  useJoinStudyGroup,
  StudyGroup,
  useLeaveStudyGroup,
  useAllOtherGroups,
} from "@/shared/hooks/useStudyGroups";
import { Colors } from "../constants/theme";
import storage from "@/shared/utils/storage";
import { Chat } from "@/components/chat/Chat";
import { useAppDispatch, useAppSelector } from "../shared/hooks/hooks";
import {
  setSearchQuery,
  setSelectedGroup,
  setShowOtherGroups,
  updateGroupJoinStatus,
  fetchStudyGroups,
  fetchOtherGroups,
} from "../shared/store/studyGroupsSlice";

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

const { height: screenHeight } = Dimensions.get("window");

export const StudySpacePage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [selectedGroupInfo, setSelectedGroupInfo] = useState<StudyGroup | null>(
    null
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showOtherGroups, setShowOtherGroups] = useState(false);

  const router = useRouter();
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  // Redux state and actions (keeping for future use)
  const dispatch = useAppDispatch();
  const reduxState = useAppSelector((state) => state.studyGroups);

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

  // Fetch groups using React Query (keeping for now, but managing state with Redux)
  const {
    data: groups,
    isLoading: reactQueryGroupsLoading,
    error: reactQueryGroupsError,
  } = useStudyGroups({
    educationLevel: user?.educationLevel,
    category: user?.category,
    graduationYear: user?.graduationYear,
    userId: user?._id,
  });

  // Fetch other groups (different from user's criteria)
  const {
    data: otherGroups,
    isLoading: reactQueryOtherGroupsLoading,
    error: reactQueryOtherGroupsError,
  } = useAllOtherGroups({
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

  const handleShowGroupInfo = (group: StudyGroup) => {
    console.log("Opening modal for group:", group.name);
    setSelectedGroupInfo(group);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setSelectedGroupInfo(null);
    setModalVisible(false);
  };

  const handleGetAllGroups = () => {
    setShowOtherGroups(!showOtherGroups);
  };

  // Filter groups based on search query
  const filterGroups = (groupList: StudyGroup[]) => {
    if (!searchQuery.trim()) return groupList;

    const query = searchQuery.toLowerCase().trim();
    return groupList.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query) ||
        group.category.toLowerCase().includes(query) ||
        group.graduationYear.toString().includes(query)
    );
  };

  const filteredGroups = groups ? filterGroups(groups) : [];
  const filteredOtherGroups = otherGroups ? filterGroups(otherGroups) : [];

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
            <IconButton
              icon="information"
              size={20}
              onPress={() => handleShowGroupInfo(group)}
              style={styles.infoIconButton}
            />
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

    if (reactQueryGroupsLoading) {
      return (
        <View style={[styles.container, styles.centered]}>
          <ActivityIndicator size="large" color={level.color} />
          <Text style={styles.loadingText}>Loading study groups...</Text>
        </View>
      );
    }

    if (reactQueryGroupsError) {
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

        {/* Search Bar */}
        <Searchbar
          placeholder="Search groups by name, category, or year..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={Colors.light.tint}
        />

        <View style={styles.groupsContainer}>
          {(() => {
            // Prioritize joined groups first
            const allGroups = groups || [];
            const joinedGroups = allGroups.filter((group) => group.isJoined);
            const notJoinedGroups = allGroups.filter(
              (group) => !group.isJoined
            );
            const sortedGroups = [...joinedGroups, ...notJoinedGroups];

            // Apply search filter to sorted groups
            const filteredSortedGroups = searchQuery.trim()
              ? sortedGroups.filter(
                  (group) =>
                    group.name
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    group.description
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    group.category
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase()) ||
                    group.graduationYear
                      .toString()
                      .includes(searchQuery.toLowerCase())
                )
              : sortedGroups;

            if (filteredSortedGroups.length > 0) {
              return (
                <>
                  {joinedGroups.length > 0 && !searchQuery.trim() && (
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionHeaderText}>
                        Your Groups ({joinedGroups.length})
                      </Text>
                    </View>
                  )}
                  {filteredSortedGroups.map(renderGroupCard)}
                </>
              );
            } else if (searchQuery.trim()) {
              return (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Title style={styles.emptyTitle}>No Groups Found</Title>
                    <Paragraph>
                      No groups match your search criteria. Try different
                      keywords.
                    </Paragraph>
                  </Card.Content>
                </Card>
              );
            } else {
              return (
                <Card style={styles.emptyCard}>
                  <Card.Content>
                    <Title style={styles.emptyTitle}>No Groups Available</Title>
                    <Paragraph>
                      No study groups found for your program. Check back later
                      or contact your administrator.
                    </Paragraph>
                  </Card.Content>
                </Card>
              );
            }
          })()}
        </View>

        {/* Other Groups Section */}
        <Card style={styles.otherGroupsCard}>
          <Card.Content>
            <View style={styles.otherGroupsHeader}>
              <Title style={styles.otherGroupsTitle}>Other Groups</Title>
              <Button
                mode="text"
                onPress={handleGetAllGroups}
                style={styles.showMoreButton}
              >
                {showOtherGroups ? "Show Less" : "Show More"}
              </Button>
            </View>
            <Paragraph style={styles.otherGroupsDescription}>
              Explore groups from other programs and years
            </Paragraph>
          </Card.Content>
        </Card>

        {showOtherGroups && (
          <View style={styles.otherGroupsContainer}>
            {reactQueryOtherGroupsLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="small" color={level.color} />
                <Text style={styles.loadingText}>Loading other groups...</Text>
              </View>
            ) : filteredOtherGroups && filteredOtherGroups.length > 0 ? (
              filteredOtherGroups.map(renderGroupCard)
            ) : searchQuery.trim() ? (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Title style={styles.emptyTitle}>No Other Groups Found</Title>
                  <Paragraph>
                    No other groups match your search criteria.
                  </Paragraph>
                </Card.Content>
              </Card>
            ) : otherGroups && otherGroups.length > 0 ? (
              otherGroups.map(renderGroupCard)
            ) : (
              <Card style={styles.emptyCard}>
                <Card.Content>
                  <Title style={styles.emptyTitle}>No Other Groups</Title>
                  <Paragraph>
                    No other groups available at the moment.
                  </Paragraph>
                </Card.Content>
              </Card>
            )}
          </View>
        )}

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

  // Render the modal at the top level so it's always available
  const renderModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleCloseModal}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={styles.modalBackdrop}
          onPress={handleCloseModal}
          activeOpacity={1}
        />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHandle} />
            <IconButton
              icon="close"
              size={24}
              onPress={handleCloseModal}
              style={styles.closeButton}
            />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedGroupInfo && (
              <>
                <Title style={styles.modalTitle}>
                  {selectedGroupInfo.name}
                </Title>
                <Text style={styles.modalSubtitle}>
                  {selectedGroupInfo.category} •{" "}
                  {selectedGroupInfo.graduationYear}
                </Text>

                <Paragraph style={styles.modalDescription}>
                  {selectedGroupInfo.description}
                </Paragraph>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Education Level</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedGroupInfo.educationLevel === "UG"
                      ? "Undergraduate"
                      : "Postgraduate"}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Category</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedGroupInfo.category}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Graduation Year</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedGroupInfo.graduationYear}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Members</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedGroupInfo.studentCount} /{" "}
                    {selectedGroupInfo.maxCapacity}
                  </Text>
                </View>

                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Status</Text>
                  <Text style={styles.modalDetailValue}>
                    {selectedGroupInfo.isFull ? "Full" : "Available"}
                  </Text>
                </View>

                {selectedGroupInfo.isJoined ? (
                  <Button
                    mode="contained"
                    onPress={() => {
                      handleCloseModal();
                      handleViewGroup(selectedGroupInfo);
                    }}
                    style={[styles.viewButton, { marginTop: 20 }]}
                  >
                    View Group Chat
                  </Button>
                ) : (
                  <Button
                    mode="contained"
                    onPress={() => {
                      handleCloseModal();
                      handleJoinGroup(selectedGroupInfo);
                    }}
                    disabled={
                      selectedGroupInfo.isFull || joinGroupMutation.isPending
                    }
                    style={[styles.joinButton, { marginTop: 20 }]}
                  >
                    {selectedGroupInfo.isFull ? "Group is Full" : "Join Group"}
                  </Button>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (selectedGroup) {
    return (
      <>
        {renderGroupView()}
        {renderModal()}
      </>
    );
  }

  if (selectedLevel) {
    return (
      <>
        <ScrollView style={styles.container}>
          {renderSelectedScreen()}
        </ScrollView>
        {renderModal()}
      </>
    );
  }

  return (
    <>
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
      {renderModal()}
    </>
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
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.tint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
    alignItems: "center",
    gap: 8,
  },
  infoIconButton: {
    margin: 0,
    padding: 4,
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
  // Other Groups styles
  otherGroupsCard: {
    backgroundColor: "white",
    marginBottom: 16,
    marginTop: 16,
  },
  otherGroupsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  otherGroupsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
  },
  otherGroupsDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    lineHeight: 20,
  },
  showMoreButton: {
    margin: 0,
  },
  otherGroupsContainer: {
    gap: 12,
  },
  // Bottom Sheet styles
  bottomSheetContent: {
    padding: 20,
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  bottomSheetSubtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 16,
  },
  bottomSheetDescription: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 16,
  },
  bottomSheetDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  bottomSheetDetailLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    fontWeight: "500",
  },
  bottomSheetDetailValue: {
    fontSize: 14,
    color: Colors.light.text,
  },
  // Search styles
  searchBar: {
    marginBottom: 16,
    backgroundColor: "white",
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.8,
    minHeight: screenHeight * 0.4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    position: "absolute",
    top: 8,
    left: "50%",
    marginLeft: -20,
  },
  closeButton: {
    margin: 0,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.light.text,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: Colors.light.icon,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalDetailLabel: {
    fontSize: 14,
    color: Colors.light.icon,
    fontWeight: "500",
  },
  modalDetailValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: "600",
  },
});
