import { useIsAuthenticated } from "@/shared/hooks/useAuth";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ActivityIndicator,
  Button,
  Chip,
  FAB,
  Paragraph,
  Searchbar,
  Title,
} from "react-native-paper";
import { Post, PostComponent } from "../components/PostComponent";
import { PostCreateForm, PostFormData } from "../components/PostCreateForm";
import { Colors } from "../constants/theme";
import {
  setSearchQuery,
  setSelectedCategory,
  setSelectedPost,
} from "../shared/store/postsSlice";
import { useAppDispatch, useAppSelector } from "../shared/hooks/hooks";
import {
  useAddComment,
  useCreatePost,
  useDeleteComment,
  useMarketplacePosts,
  usePost,
} from "../shared/hooks/usePosts";
import storage from "../shared/utils/storage";

// Image mapping for local assets
const imageMap: { [key: string]: any } = {
  "calculas textbook.jpg": require("../assets/images/calculas textbook.jpg"),
  "macbook pro.jpg": require("../assets/images/macbook pro.jpg"),
  "chemistry guide.jpg": require("../assets/images/chemistry guide.jpg"),
  "calculator.jpg": require("../assets/images/calculator.jpg"),
  "mini fridge.jpg": require("../assets/images/mini fridge.jpg"),
  "psychology textbook.jpg": require("../assets/images/psychology textbook.jpg"),
};

interface MarketItem {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: "New" | "Like New" | "Good" | "Fair";
  seller: string;
  imageId: string; // Reference to image in assets/images folder
  author?: string; // For books
  isbn?: string; // For books
}

const marketItems: MarketItem[] = [
  {
    id: "1",
    title: "Calculus Textbook - 8th Edition",
    description:
      "Essential calculus textbook in excellent condition. All pages intact, minimal highlighting.",
    price: 45.0,
    category: "Books",
    condition: "Like New",
    seller: "Sarah M.",
    imageId: "calculas textbook.jpg",
    author: "James Stewart",
    isbn: "978-1285740621",
  },
  {
    id: "2",
    title: "MacBook Pro 13-inch (2019)",
    description:
      "Reliable laptop perfect for students. Includes charger and protective case.",
    price: 850.0,
    category: "Electronics",
    condition: "Good",
    seller: "Alex K.",
    imageId: "macbook pro.jpg",
  },
  {
    id: "3",
    title: "Organic Chemistry Study Guide",
    description:
      "Comprehensive study guide with practice problems and solutions.",
    price: 25.0,
    category: "Books",
    condition: "New",
    seller: "Emma L.",
    imageId: "chemistry guide.jpg",
    author: "David R. Klein",
    isbn: "978-1118083383",
  },
  {
    id: "4",
    title: "Scientific Calculator TI-84",
    description:
      "Graphing calculator required for advanced math courses. Barely used.",
    price: 75.0,
    category: "Electronics",
    condition: "Like New",
    seller: "Mike R.",
    imageId: "calculator.jpg",
  },
  {
    id: "5",
    title: "Dorm Room Mini Fridge",
    description:
      "Compact refrigerator perfect for dorm rooms. Energy efficient and quiet.",
    price: 120.0,
    category: "Appliances",
    condition: "Good",
    seller: "Jessica T.",
    imageId: "mini fridge.jpg",
  },
  {
    id: "6",
    title: "Psychology Textbook Bundle",
    description:
      "Complete set of psychology textbooks for intro and advanced courses.",
    price: 95.0,
    category: "Books",
    condition: "Good",
    seller: "David W.",
    imageId: "psychology textbook.jpg",
    author: "David G. Myers",
    isbn: "978-1464140815",
  },
];

const categories = [
  "All",
  "Books",
  "Electronics",
  "Appliances",
  "Furniture",
  "Clothing",
];

export const MarketPage: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const router = useRouter();
  const { data: isAuthenticated, isLoading } = useIsAuthenticated();

  // Redux state and actions
  const dispatch = useAppDispatch();
  const {
    selectedCategory: reduxSelectedCategory,
    searchQuery: reduxSearchQuery,
    selectedPost: reduxSelectedPost,
    isLoading: reduxPostsLoading,
    error: reduxPostsError,
  } = useAppSelector((state) => state.posts);

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
      }
    };
    getUserData();
  }, []);

  // Fetch marketplace posts (keeping React Query for now, but managing filters with Redux)
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
  } = useMarketplacePosts(
    reduxSelectedCategory === "All" ? undefined : reduxSelectedCategory,
    currentUser?._id
  );

  // Get specific post for detailed view
  const { data: fullPost, isLoading: postLoading } = usePost(
    reduxSelectedPost?._id || ""
  );

  // Mutations
  const createPostMutation = useCreatePost();
  const addCommentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading]);

  // Show loading or redirect if not authenticated
  if (isLoading || !isAuthenticated || !currentUser) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
      </View>
    );
  }

  const handleCreatePost = async (postData: PostFormData) => {
    try {
      await createPostMutation.mutateAsync(postData);
      setShowCreateForm(false);
      Alert.alert("Success", "Post created successfully!");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create post");
    }
  };

  const handlePostClick = (post: Post) => {
    dispatch(setSelectedPost(post as any)); // Type conversion for now
  };

  const handleAddComment = async (postId: string, content: string) => {
    await addCommentMutation.mutateAsync({ postId, content });
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    await deleteCommentMutation.mutateAsync({ postId, commentId });
  };

  const handleCategorySelect = (category: string) => {
    dispatch(setSelectedCategory(category));
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  // Filter posts based on Redux search query
  const filteredPosts =
    posts?.filter((post: Post) => {
      if (!reduxSearchQuery.trim()) return true;
      const query = reduxSearchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    }) || [];

  // Show create form
  if (showCreateForm) {
    return (
      <PostCreateForm
        mode="marketplace"
        onSubmit={handleCreatePost}
        onCancel={() => setShowCreateForm(false)}
        isLoading={createPostMutation.isPending}
      />
    );
  }

  // Show detailed post view
  if (reduxSelectedPost) {
    const postToShow = fullPost || reduxSelectedPost;
    return (
      <View style={styles.container}>
        <View style={styles.detailHeader}>
          <Button
            mode="outlined"
            onPress={() => dispatch(setSelectedPost(null))}
            icon="arrow-left"
            style={styles.backButton}
          >
            Back to Market
          </Button>
        </View>
        <ScrollView style={styles.detailContent}>
          <PostComponent
            post={postToShow as any}
            onPostClick={() => {}}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
            showComments={true}
            currentUserId={currentUser._id}
            isLoading={postLoading}
          />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <MaterialIcons
            name="storefront"
            size={40}
            color={Colors.light.tint}
          />
          <Title style={styles.headerTitle}>Campus Market</Title>
          <Paragraph style={styles.headerSubtitle}>
            Buy and sell items with fellow students
          </Paragraph>
        </View>

        <View style={styles.searchSection}>
          <Searchbar
            placeholder="Search posts..."
            onChangeText={handleSearchChange}
            value={reduxSearchQuery}
            style={styles.searchBar}
          />
        </View>

        <View style={styles.categoriesSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesContainer}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={reduxSelectedCategory === category}
                  onPress={() => handleCategorySelect(category)}
                  style={[
                    styles.categoryChip,
                    reduxSelectedCategory === category &&
                      styles.selectedCategoryChip,
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    reduxSelectedCategory === category &&
                      styles.selectedCategoryChipText,
                  ]}
                >
                  {category}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {filteredPosts.length} post{filteredPosts.length !== 1 ? "s" : ""}{" "}
            found
          </Text>
        </View>

        {postsLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.light.tint} />
            <Text style={styles.loadingText}>Loading posts...</Text>
          </View>
        ) : postsError ? (
          <View style={styles.errorContainer}>
            <MaterialIcons name="error" size={60} color="#d32f2f" />
            <Title style={styles.errorTitle}>Error Loading Posts</Title>
            <Paragraph style={styles.errorDescription}>
              Failed to load marketplace posts. Please try again.
            </Paragraph>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons
              name="post-add"
              size={60}
              color={Colors.light.icon}
            />
            <Title style={styles.emptyTitle}>No posts yet</Title>
            <Paragraph style={styles.emptyDescription}>
              Be the first to create a marketplace post!
            </Paragraph>
          </View>
        ) : (
          <View style={styles.postsList}>
            {filteredPosts.map((post) => (
              <PostComponent
                key={post._id}
                post={post}
                onPostClick={handlePostClick}
                currentUserId={currentUser._id}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowCreateForm(true)}
        label="Create Post"
      />
    </View>
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
    flex: 1,
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
  searchSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    backgroundColor: "white",
  },
  categoriesSection: {
    marginBottom: 16,
  },
  categoriesContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: "white",
  },
  selectedCategoryChip: {
    backgroundColor: Colors.light.tint,
  },
  categoryChipText: {
    color: Colors.light.text,
  },
  selectedCategoryChipText: {
    color: "white",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 16,
    color: Colors.light.text,
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sortText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: "500",
  },
  postsList: {
    paddingHorizontal: 16,
  },
  itemsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: "white",
    marginBottom: 16,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 4,
  },
  authorText: {
    fontSize: 14,
    color: Colors.light.icon,
    fontStyle: "italic",
    marginBottom: 2,
  },
  isbnText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.light.tint,
  },
  conditionChip: {
    height: 28,
  },
  conditionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  sellerText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.icon,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    height: 24,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.text,
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
  },
  favoriteButton: {
    flex: 1,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: "center",
    marginTop: 8,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.icon,
  },
  errorContainer: {
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    color: "#d32f2f",
    marginTop: 16,
    textAlign: "center",
  },
  errorDescription: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: "center",
    marginTop: 8,
  },
  detailHeader: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    alignSelf: "flex-start",
  },
  detailContent: {
    flex: 1,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.light.tint,
  },
});
