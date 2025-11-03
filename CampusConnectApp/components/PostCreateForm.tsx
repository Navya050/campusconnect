import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  Card,
  Title,
  Button,
  Chip,
  RadioButton,
  Divider,
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "../constants/theme";

interface PostCreateFormProps {
  mode: "marketplace" | "study-group";
  groupId?: string;
  groupName?: string;
  onSubmit: (postData: PostFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface PostFormData {
  title: string;
  content: string;
  image?: string;
  mode: "marketplace" | "study-group";
  groupId?: string;
  category?: string;
  tags: string[];
}

const marketplaceCategories = [
  "Books",
  "Electronics",
  "Appliances",
  "Furniture",
  "Clothing",
  "Sports",
  "Other",
];

export const PostCreateForm: React.FC<PostCreateFormProps> = ({
  mode,
  groupId,
  groupName,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission Required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (asset.base64) {
          // Create base64 string with data URL format
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          setSelectedImage(base64Image);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < 5) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert("Error", "Please enter a title");
      return;
    }

    if (!content.trim()) {
      Alert.alert("Error", "Please enter content");
      return;
    }

    if (mode === "marketplace" && !selectedCategory) {
      Alert.alert("Error", "Please select a category");
      return;
    }

    const postData: PostFormData = {
      title: title.trim(),
      content: content.trim(),
      mode,
      tags,
    };

    if (selectedImage) {
      postData.image = selectedImage;
    }

    if (mode === "marketplace") {
      postData.category = selectedCategory;
    } else {
      postData.groupId = groupId;
    }

    try {
      await onSubmit(postData);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create post");
    }
  };

  const getModeIcon = () => {
    return mode === "marketplace" ? "storefront" : "group";
  };

  const getModeColor = () => {
    return mode === "marketplace" ? "#FF9800" : "#4CAF50";
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Content>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.modeInfo}>
              <MaterialIcons
                name={getModeIcon()}
                size={24}
                color={getModeColor()}
              />
              <Title style={[styles.headerTitle, { color: getModeColor() }]}>
                Create {mode === "marketplace" ? "Marketplace" : "Study Group"}{" "}
                Post
              </Title>
            </View>
            {mode === "study-group" && groupName && (
              <Text style={styles.groupName}>in {groupName}</Text>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Title Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter post title..."
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              multiline={false}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* Image Upload */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Image (Optional)</Text>
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: selectedImage }}
                  style={styles.selectedImage}
                />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={handleRemoveImage}
                >
                  <MaterialIcons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.imagePickerButton}
                onPress={handleImagePicker}
              >
                <MaterialIcons
                  name="add-photo-alternate"
                  size={40}
                  color={Colors.light.icon}
                />
                <Text style={styles.imagePickerText}>Tap to add an image</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Content Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Content *</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="Write your post content..."
              value={content}
              onChangeText={setContent}
              maxLength={1000}
              multiline
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{content.length}/1000</Text>
          </View>

          {/* Category Selection (Marketplace only) */}
          {mode === "marketplace" && (
            <View style={styles.inputSection}>
              <Text style={styles.label}>Category *</Text>
              <View style={styles.categoryContainer}>
                {marketplaceCategories.map((category) => (
                  <View key={category} style={styles.radioItem}>
                    <RadioButton
                      value={category}
                      status={
                        selectedCategory === category ? "checked" : "unchecked"
                      }
                      onPress={() => setSelectedCategory(category)}
                      color={Colors.light.tint}
                    />
                    <Text style={styles.radioLabel}>{category}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Tags (Optional)</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Add a tag..."
                value={tagInput}
                onChangeText={setTagInput}
                maxLength={20}
                onSubmitEditing={handleAddTag}
              />
              <Button
                mode="outlined"
                onPress={handleAddTag}
                disabled={!tagInput.trim() || tags.length >= 5}
                style={styles.addTagButton}
                compact
              >
                Add
              </Button>
            </View>

            {/* Tags Display */}
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    style={styles.tag}
                    textStyle={styles.tagText}
                    onClose={() => handleRemoveTag(tag)}
                  >
                    {tag}
                  </Chip>
                ))}
              </View>
            )}
            <Text style={styles.tagHint}>
              You can add up to 5 tags. Tags help others find your post.
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={onCancel}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={isLoading}
              disabled={isLoading}
            >
              Create Post
            </Button>
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
  formCard: {
    margin: 16,
    backgroundColor: "white",
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  modeInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 8,
  },
  groupName: {
    fontSize: 14,
    color: Colors.light.icon,
    fontStyle: "italic",
  },
  divider: {
    marginVertical: 16,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.light.text,
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  contentInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
    backgroundColor: "#fafafa",
  },
  charCount: {
    fontSize: 12,
    color: Colors.light.icon,
    textAlign: "right",
    marginTop: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 8,
  },
  radioLabel: {
    fontSize: 14,
    color: Colors.light.text,
    marginLeft: 4,
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  addTagButton: {
    minWidth: 60,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  tag: {
    backgroundColor: Colors.light.tint,
  },
  tagText: {
    color: "white",
    fontSize: 12,
  },
  tagHint: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 8,
    fontStyle: "italic",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  // Image upload styles
  imageContainer: {
    position: "relative",
    alignSelf: "center",
  },
  selectedImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: "#e0e0e0",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  imagePickerText: {
    fontSize: 14,
    color: Colors.light.icon,
    marginTop: 8,
  },
});
