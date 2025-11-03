import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  TextInput,
  Alert,
  Image,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  Divider,
  ActivityIndicator,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { Colors } from "../constants/theme";

export interface Post {
  _id: string;
  title: string;
  content: string;
  image?: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  authorName: string;
  mode: "marketplace" | "study-group";
  groupId?: {
    _id: string;
    name: string;
  };
  category?: string;
  comments: Comment[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  commentCount?: number;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

interface PostComponentProps {
  post: Post;
  onPostClick: (post: Post) => void;
  onAddComment?: (postId: string, content: string) => Promise<void>;
  onDeleteComment?: (postId: string, commentId: string) => Promise<void>;
  showComments?: boolean;
  currentUserId?: string;
  isLoading?: boolean;
}

export const PostComponent: React.FC<PostComponentProps> = ({
  post,
  onPostClick,
  onAddComment,
  onDeleteComment,
  showComments = false,
  currentUserId,
  isLoading = false,
}) => {
  const [commentText, setCommentText] = useState("");
  const [isAddingComment, setIsAddingComment] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !onAddComment) return;

    setIsAddingComment(true);
    try {
      await onAddComment(post._id, commentText.trim());
      setCommentText("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add comment");
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!onDeleteComment) return;

    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await onDeleteComment(post._id, commentId);
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete comment");
            }
          },
        },
      ]
    );
  };

  const getModeIcon = () => {
    return post.mode === "marketplace" ? "storefront" : "group";
  };

  const getModeColor = () => {
    return post.mode === "marketplace" ? "#FF9800" : "#4CAF50";
  };

  return (
    <Card style={styles.postCard}>
      <Card.Content>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.postMeta}>
            <MaterialIcons
              name={getModeIcon()}
              size={16}
              color={getModeColor()}
            />
            <Text style={[styles.modeText, { color: getModeColor() }]}>
              {post.mode === "marketplace" ? "Marketplace" : "Study Group"}
            </Text>
            {post.groupId && (
              <Text style={styles.groupText}>• {post.groupId.name}</Text>
            )}
            {post.category && (
              <Text style={styles.categoryText}>• {post.category}</Text>
            )}
          </View>
          <Text style={styles.dateText}>{formatDate(post.createdAt)}</Text>
        </View>

        {/* Post Title */}
        <TouchableOpacity onPress={() => onPostClick(post)}>
          <Title style={styles.postTitle}>{post.title}</Title>
        </TouchableOpacity>

        {/* Post Content */}
        <TouchableOpacity onPress={() => onPostClick(post)}>
          <Paragraph
            style={styles.postContent}
            numberOfLines={showComments ? undefined : 3}
          >
            {post.content}
          </Paragraph>
        </TouchableOpacity>

        {/* Post Image */}
        {post.image && (
          <TouchableOpacity onPress={() => onPostClick(post)}>
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        {/* Author Info */}
        <View style={styles.authorInfo}>
          <MaterialIcons name="person" size={16} color={Colors.light.icon} />
          <Text style={styles.authorText}>by {post.authorName}</Text>
        </View>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {post.tags.map((tag, index) => (
              <Chip key={index} style={styles.tag} textStyle={styles.tagText}>
                {tag}
              </Chip>
            ))}
          </View>
        )}

        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onPostClick(post)}
          >
            <MaterialIcons name="comment" size={20} color={Colors.light.tint} />
            <Text style={styles.actionText}>
              {post.comments?.length || 0} Comments
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {showComments && (
          <>
            <Divider style={styles.divider} />

            {/* Add Comment */}
            {onAddComment && (
              <View style={styles.addCommentSection}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Write a comment..."
                  value={commentText}
                  onChangeText={setCommentText}
                  multiline
                  maxLength={500}
                />
                <Button
                  mode="contained"
                  onPress={handleAddComment}
                  disabled={!commentText.trim() || isAddingComment}
                  style={styles.addCommentButton}
                  loading={isAddingComment}
                >
                  Comment
                </Button>
              </View>
            )}

            {/* Comments List */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.light.tint} />
                <Text style={styles.loadingText}>Loading comments...</Text>
              </View>
            ) : (
              <View style={styles.commentsContainer}>
                {post.comments && post.comments.length > 0 ? (
                  post.comments.map((comment) => (
                    <View key={comment._id} style={styles.commentCard}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>
                          {comment.authorName}
                        </Text>
                        <View style={styles.commentMeta}>
                          <Text style={styles.commentDate}>
                            {formatDate(comment.createdAt)}
                          </Text>
                          {(currentUserId === comment.author._id ||
                            currentUserId === post.author._id) &&
                            onDeleteComment && (
                              <TouchableOpacity
                                onPress={() => handleDeleteComment(comment._id)}
                                style={styles.deleteButton}
                              >
                                <MaterialIcons
                                  name="delete"
                                  size={16}
                                  color="#d32f2f"
                                />
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>
                      <Text style={styles.commentContent}>
                        {comment.content}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noCommentsText}>
                    No comments yet. Be the first to comment!
                  </Text>
                )}
              </View>
            )}
          </>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: "white",
    marginBottom: 12,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modeText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  groupText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginLeft: 4,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 11,
    color: Colors.light.icon,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  postContent: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  authorText: {
    fontSize: 12,
    color: Colors.light.icon,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "#f0f0f0",
    height: 24,
  },
  tagText: {
    fontSize: 10,
    color: Colors.light.text,
  },
  postActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
  },
  actionText: {
    fontSize: 12,
    color: Colors.light.tint,
    marginLeft: 4,
    fontWeight: "500",
  },
  divider: {
    marginVertical: 16,
  },
  addCommentSection: {
    marginBottom: 16,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 60,
    textAlignVertical: "top",
    fontSize: 14,
  },
  addCommentButton: {
    alignSelf: "flex-end",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.light.icon,
  },
  commentsContainer: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.light.tint,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.light.text,
  },
  commentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentDate: {
    fontSize: 11,
    color: Colors.light.icon,
  },
  deleteButton: {
    padding: 4,
  },
  commentContent: {
    fontSize: 13,
    color: Colors.light.text,
    lineHeight: 18,
  },
  noCommentsText: {
    fontSize: 14,
    color: Colors.light.icon,
    textAlign: "center",
    fontStyle: "italic",
    padding: 16,
  },
});
