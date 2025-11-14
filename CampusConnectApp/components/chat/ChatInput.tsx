import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { IconButton, Surface } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { ChatMessage } from "@/shared/services/socketService";
import { Colors } from "@/constants/theme";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onSendMedia?: (
    media: { uri: string; type: string; name: string },
    message?: string
  ) => void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onSendMedia,
  onTyping,
  disabled = false,
}) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTextChange = (text: string) => {
    setMessage(text);

    // Handle typing indicator
    if (onTyping) {
      if (!isTyping && text.length > 0) {
        setIsTyping(true);
        onTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          onTyping(false);
        }
      }, 1000);
    }
  };

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    const messageText = message.trim();

    setMessage("");
    setIsTyping(false);
    onTyping?.(false);

    onSendMessage(messageText);
  };

  const handleImagePicker = async () => {
    if (disabled) return;

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
          // Create base64 string with data URL format (same as market post)
          const base64Image = `data:image/jpeg;base64,${asset.base64}`;
          const media = {
            uri: base64Image,
            type: "image",
            name: asset.fileName || `image_${Date.now()}.jpg`,
          };

          onSendMedia?.(media, message.trim() || undefined);
          setMessage("");
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleDocumentPicker = async () => {
    if (disabled) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const media = {
          uri: asset.uri,
          type: "file",
          name: asset.name || `file_${Date.now()}`,
        };

        onSendMedia?.(media, message.trim() || undefined);
        setMessage("");
      }
    } catch (error) {
      console.error("Error opening document picker:", error);
      Alert.alert("Error", "Failed to open document picker");
    }
  };

  const handleMediaPicker = async () => {
    console.log("Media picker button pressed, disabled:", disabled);

    if (disabled) {
      console.log("Media picker disabled, returning");
      return;
    }

    console.log("Showing media picker alert");

    Alert.alert("Select Media", "Choose an option", [
      {
        text: "Photo Library",
        onPress: () => {
          console.log("Photo Library selected");
          handleImagePicker();
        },
      },
      {
        text: "Document",
        onPress: () => {
          console.log("Document selected");
          handleDocumentPicker();
        },
      },
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => console.log("Media picker cancelled"),
      },
    ]);
  };

  const handleImagePickerV2 = async () => {
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
          // setSelectedImage(base64Image);
          console.log(asset.fileName);
          const media = {
            uri: base64Image,
            type: "image",
            name: asset.fileName || `image_${Date.now()}.jpg`,
          };

          onSendMedia?.(media, message.trim() || undefined);
          setMessage(""); // Clear message after sending media
          console.log(base64Image);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.inputContainer} elevation={2}>
        <TouchableOpacity
          onPress={handleImagePickerV2}
          disabled={disabled}
          style={styles.attachButton}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons
            name="attach-file"
            size={24}
            color={disabled ? Colors.light.icon : Colors.light.tint}
          />
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor={Colors.light.icon}
          value={message}
          onChangeText={handleTextChange}
          multiline
          maxLength={1000}
          editable={!disabled}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (!message.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!message.trim() || disabled}
        >
          <MaterialIcons
            name="send"
            size={20}
            color={!message.trim() || disabled ? Colors.light.icon : "white"}
          />
        </TouchableOpacity>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
  },
  replyPreview: {
    margin: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
  },
  replyContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  replyBar: {
    width: 3,
    height: "100%",
    backgroundColor: Colors.light.tint,
    borderRadius: 1.5,
    marginRight: 12,
  },
  replyText: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.tint,
    marginBottom: 2,
  },
  replyMessage: {
    fontSize: 14,
    color: Colors.light.text,
  },
  cancelReplyButton: {
    margin: 0,
    width: 32,
    height: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    margin: 16,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: "white",
    borderRadius: 24,
    minHeight: 48,
  },
  attachButton: {
    margin: 0,
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 100,
    ...Platform.select({
      ios: {
        paddingTop: 8,
      },
      android: {
        paddingTop: 6,
      },
    }),
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.tint,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#e0e0e0",
  },
});
