import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Linking,
} from "react-native";
import { Surface, IconButton } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { ChatMessage as ChatMessageType } from "@/shared/services/socketService";
import { Colors } from "@/constants/theme";

interface ChatMessageProps {
  message: ChatMessageType;
  isOwnMessage: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isOwnMessage,
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleMediaPress = () => {
    if (message.mediaUrl) {
      // For now, we'll just log the URL. In a real app, you'd open it properly
      console.log("Opening media:", message.mediaUrl);
      // You could use expo-web-browser or similar to open files
      if (message.messageType === "file") {
        Linking.openURL(getMediaUrl(message.mediaUrl));
      }
    }
  };

  const getMediaUrl = (mediaPath: string) => {
    // Check if it's already a base64 data URL
    if (mediaPath.startsWith("data:image/")) {
      return mediaPath;
    }

    // Convert backend file path to accessible URL
    const baseUrl =
      process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.177:3406/api";
    const filename = mediaPath.split("/").pop();
    return `${baseUrl}/chat/uploads/${filename}`;
  };

  const renderReplyMessage = () => {
    if (!message.replyTo) return null;

    return (
      <View style={styles.replyContainer}>
        <View style={styles.replyBar} />
        <View style={styles.replyContent}>
          <Text style={styles.replyAuthor}>{message.replyTo.senderName}</Text>
          <Text style={styles.replyText} numberOfLines={2}>
            {message.replyTo.message}
          </Text>
        </View>
      </View>
    );
  };

  const renderMessageContent = () => {
    switch (message.messageType) {
      case "image":
        return (
          <View>
            {message.message && (
              <Text
                style={[
                  styles.messageText,
                  isOwnMessage && styles.ownMessageText,
                ]}
              >
                {message.message}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleMediaPress}
              style={styles.imageContainer}
            >
              <Image
                source={{ uri: getMediaUrl(message.mediaUrl || "") }}
                style={styles.messageImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          </View>
        );

      case "file":
        return (
          <View>
            {message.message && (
              <Text
                style={[
                  styles.messageText,
                  isOwnMessage && styles.ownMessageText,
                ]}
              >
                {message.message}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleMediaPress}
              style={styles.fileContainer}
            >
              <MaterialIcons
                name="attach-file"
                size={24}
                color={Colors.light.tint}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{message.mediaName}</Text>
                {message.mediaSize && (
                  <Text style={styles.fileSize}>
                    {formatFileSize(message.mediaSize)}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <Text
            style={[styles.messageText, isOwnMessage && styles.ownMessageText]}
          >
            {message.message}
          </Text>
        );
    }
  };

  return (
    <View
      style={[styles.container, isOwnMessage && styles.ownMessageContainer]}
    >
      <Surface
        style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
        ]}
        elevation={1}
      >
        <Text style={[styles.senderName, isOwnMessage && styles.ownSenderName]}>
          {message.senderName}
        </Text>

        {renderReplyMessage()}
        {renderMessageContent()}

        <View style={styles.messageFooter}>
          <Text style={[styles.timestamp, isOwnMessage && styles.ownTimestamp]}>
            {formatTime(message.createdAt)}
          </Text>
          {message.isEdited && (
            <Text
              style={[
                styles.editedLabel,
                isOwnMessage && styles.ownEditedLabel,
              ]}
            >
              edited
            </Text>
          )}
        </View>
      </Surface>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    marginHorizontal: 16,
    alignItems: "flex-end",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  otherMessageBubble: {
    backgroundColor: "#f5f5f5",
    borderBottomLeftRadius: 4,
  },
  ownMessageBubble: {
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.light.tint,
    marginBottom: 4,
  },
  ownSenderName: {
    color: "rgba(255,255,255,0.9)",
  },
  replyContainer: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 8,
  },
  replyBar: {
    width: 3,
    backgroundColor: Colors.light.tint,
    borderRadius: 1.5,
    marginRight: 8,
  },
  replyContent: {
    flex: 1,
  },
  replyAuthor: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.light.tint,
    marginBottom: 2,
  },
  replyText: {
    fontSize: 12,
    color: Colors.light.icon,
    fontStyle: "italic",
  },
  messageText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: "white",
  },
  imageContainer: {
    marginTop: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 8,
  },
  fileInfo: {
    marginLeft: 8,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.light.text,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.light.icon,
    marginTop: 2,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    justifyContent: "flex-end",
  },
  timestamp: {
    fontSize: 11,
    color: Colors.light.icon,
  },
  ownTimestamp: {
    color: "rgba(255,255,255,0.8)",
  },
  editedLabel: {
    fontSize: 10,
    color: Colors.light.icon,
    marginLeft: 4,
    fontStyle: "italic",
  },
  ownEditedLabel: {
    color: "rgba(255,255,255,0.6)",
  },
});
