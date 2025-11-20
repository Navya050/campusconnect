import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const previousMessageCount = useRef(0);

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

  console.log(messages);

  // Initial scroll to bottom when first entering chat
  useEffect(() => {
    if (messages.length > 0 && !hasInitiallyScrolled && !isLoading) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        setHasInitiallyScrolled(true);
        previousMessageCount.current = messages.length;
      }, 200);
    }
  }, [messages.length, hasInitiallyScrolled, isLoading]);

  // Auto-scroll to bottom only when new messages arrive AND user is near bottom
  useEffect(() => {
    if (
      messages.length > previousMessageCount.current &&
      hasInitiallyScrolled
    ) {
      // Only auto-scroll if user is near the bottom (not manually scrolling up)
      if (isNearBottom && !isUserScrolling) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
      previousMessageCount.current = messages.length;
    }
  }, [messages.length, hasInitiallyScrolled, isNearBottom, isUserScrolling]);

  // Reset scroll state when groupId changes (switching between chats)
  useEffect(() => {
    setHasInitiallyScrolled(false);
    setIsUserScrolling(false);
    setIsNearBottom(true);
    previousMessageCount.current = 0;
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
          process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.178:3406/api"
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

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessageType }) => {
      const isOwnMessage = item.senderId === currentUserId;

      return <ChatMessage message={item} isOwnMessage={isOwnMessage} />;
    },
    [currentUserId]
  );

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
          messages={messages}
          disabled={!isConnected}
        />
      </KeyboardAvoidingView>
    );
  }

  const scrollToBottom = () => {
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
      setIsNearBottom(true);
    }
  };

  const handleScroll = (event: any) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - layoutMeasurement.height - contentOffset.y;

    // Consider user "near bottom" if within 100 pixels of the bottom
    const nearBottom = distanceFromBottom < 100;
    setIsNearBottom(nearBottom);
  };

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true);
  };

  const handleScrollEndDrag = () => {
    // Keep scrolling flag for a bit longer to prevent immediate auto-scroll
    setTimeout(() => {
      setIsUserScrolling(false);
    }, 500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
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
        onScroll={handleScroll}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={Platform.OS === "web"}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews={Platform.OS === "android"}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={20}
        getItemLayout={undefined}
      />

      {renderTypingIndicator()}

      <ChatInput
        onSendMessage={handleSendMessage}
        onSendMedia={handleSendMedia}
        onTyping={sendTyping}
        messages={messages}
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
