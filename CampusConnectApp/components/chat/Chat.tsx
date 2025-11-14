import React, { useState, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { ActivityIndicator, Surface } from "react-native-paper";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { useChat, useSendMedia } from "@/shared/hooks/useChat";
import { ChatMessage as ChatMessageType } from "@/shared/services/socketService";
import socketService from "@/shared/services/socketService";
import { Colors } from "@/constants/theme";
import storage from "@/shared/utils/storage";

interface ChatProps {
  groupId: string;
  currentUserId: string;
}

export const Chat: React.FC<ChatProps> = ({ groupId, currentUserId }) => {
  const flatListRef = useRef<FlatList>(null);
  const [hasInitiallyScrolled, setHasInitiallyScrolled] = useState(false);

  const {
    messages,
    typingUsers,
    isConnected,
    isLoading,
    error,
    sendMessage,
    sendTyping,
    markAsRead,
  } = useChat(groupId, currentUserId);

  // Initial scroll to bottom when first entering chat
  useEffect(() => {
    if (messages.length > 0 && !hasInitiallyScrolled && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setHasInitiallyScrolled(true);
      }, 200);
    }
  }, [messages.length, hasInitiallyScrolled, isLoading]);

  // Auto-scroll to bottom when new messages arrive (after initial load)
  useEffect(() => {
    if (messages.length > 0 && hasInitiallyScrolled) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, hasInitiallyScrolled]);

  // Reset scroll state when groupId changes (switching between chats)
  useEffect(() => {
    setHasInitiallyScrolled(false);
  }, [groupId]);

  // Mark messages as read when they come into view
  useEffect(() => {
    const unreadMessages = messages
      .filter(
        (msg) =>
          msg.senderId !== currentUserId &&
          !msg.readBy.some((read) => read.userId === currentUserId)
      )
      .map((msg) => msg._id);

    if (unreadMessages.length > 0) {
      markAsRead(unreadMessages);
    }
  }, [messages, currentUserId, markAsRead]);

  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  const handleSendMedia = async (
    media: { uri: string; type: string; name: string },
    message?: string,
    replyToId?: string
  ) => {
    try {
      const token = await storage.getItem("token");
      if (!token) {
        Alert.alert("Error", "Authentication token not found");
        return;
      }

      // Prepare JSON payload similar to market posts
      const mediaData: any = {
        message: message || "",
        mediaType: media.type,
        mediaName: media.name,
      };

      // For images, send base64 data directly (like market posts)
      if (media.type === "image" && media.uri.startsWith("data:image")) {
        mediaData.mediaData = media.uri; // Base64 string with data URL format
      } else {
        // For other file types, we still need to handle them differently
        // This is a fallback for non-image files
        mediaData.mediaData = media.uri;
      }

      if (replyToId) {
        mediaData.replyTo = replyToId;
      }

      const response = await fetch(
        `${
          process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.177:3406/api"
        }/chat/${groupId}/messages/media`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(mediaData),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send media");
      }

      // The socket will handle the real-time update
      console.log("Media sent successfully");
    } catch (error) {
      console.error("Error sending media:", error);
      Alert.alert("Error", "Failed to send media. Please try again.");
    }
  };

  const renderMessage = ({ item }: { item: ChatMessageType }) => {
    const isOwnMessage = item.senderId === currentUserId;

    // Debug log to check the comparison
    console.log(
      "Message senderId:",
      item.senderId,
      "Current userId:",
      currentUserId,
      "isOwnMessage:",
      isOwnMessage
    );

    return <ChatMessage message={item} isOwnMessage={isOwnMessage} />;
  };

  const renderTypingIndicator = () => {
    if (typingUsers.length === 0) return null;

    const typingText =
      typingUsers.length === 1
        ? `${typingUsers[0].userName} is typing...`
        : `${typingUsers.length} people are typing...`;

    return (
      <Surface style={styles.typingIndicator} elevation={1}>
        <Text style={styles.typingText}>{typingText}</Text>
        <View style={styles.typingDots}>
          <View style={[styles.dot, styles.dot1]} />
          <View style={[styles.dot, styles.dot2]} />
          <View style={[styles.dot, styles.dot3]} />
        </View>
      </Surface>
    );
  };

  const renderConnectionStatus = () => {
    if (isConnected) return null;

    return (
      <Surface style={styles.connectionStatus} elevation={2}>
        <Text style={styles.connectionText}>
          {isLoading ? "Connecting..." : "Disconnected"}
        </Text>
        {isLoading && (
          <ActivityIndicator size="small" color={Colors.light.tint} />
        )}
      </Surface>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>
        No messages yet. Start the conversation!
      </Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorText}>{error || "Failed to load messages"}</Text>
    </View>
  );

  if (error && messages.length === 0) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {renderError()}
        <ChatInput
          onSendMessage={handleSendMessage}
          onSendMedia={handleSendMedia}
          onTyping={sendTyping}
          disabled={!isConnected}
        />
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {renderConnectionStatus()}

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContainer,
          messages.length === 0 && styles.emptyContainer,
        ]}
        ListEmptyComponent={isLoading ? null : renderEmptyState}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
        showsVerticalScrollIndicator={false}
      />

      {renderTypingIndicator()}

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        onTyping={sendTyping}
        disabled={!isConnected}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff3cd",
    borderBottomWidth: 1,
    borderBottomColor: "#ffeaa7",
  },
  connectionText: {
    fontSize: 14,
    color: "#856404",
    marginRight: 8,
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.icon,
    textAlign: "center",
  },
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: "#d32f2f",
    textAlign: "center",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "white",
    borderRadius: 16,
  },
  typingText: {
    fontSize: 14,
    color: Colors.light.icon,
    fontStyle: "italic",
    marginRight: 8,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.icon,
    marginHorizontal: 1,
  },
  dot1: {
    opacity: 0.4,
  },
  dot2: {
    opacity: 0.7,
  },
  dot3: {
    opacity: 1,
  },
});
