import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { config } from "@/shared/config";
import storage from "@/shared/utils/storage";
import socketService, {
  ChatMessage,
  TypingUser,
} from "@/shared/services/socketService";

const API_URL = config.API_URL;

// Types
interface SendMessageData {
  groupId: string;
  message: string;
  replyTo?: string;
}

interface SendMediaData {
  groupId: string;
  media: {
    uri: string;
    type: string;
    name: string;
  };
  message?: string;
  replyTo?: string;
}

interface ChatPagination {
  page: number;
  limit: number;
}

// API functions
const chatAPI = {
  getMessages: async (
    groupId: string,
    page = 1,
    limit = 50
  ): Promise<{ data: ChatMessage[]; pagination: ChatPagination }> => {
    const token = await storage.getItem("token");
    const response = await fetch(`${API_URL}/chat/${groupId}/messages`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch messages");
    }

    return response.json();
  },

  sendMessage: async (data: SendMessageData): Promise<ChatMessage> => {
    const token = await storage.getItem("token");
    const response = await fetch(`${API_URL}/chat/${data.groupId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        message: data.message,
        replyTo: data.replyTo,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send message");
    }

    const result = await response.json();
    return result.data;
  },

  sendMedia: async (data: SendMediaData): Promise<ChatMessage> => {
    const token = await storage.getItem("token");
    const formData = new FormData();

    formData.append("media", {
      uri: data.media.uri,
      type: data.media.type,
      name: data.media.name,
    } as any);

    if (data.message) {
      formData.append("message", data.message);
    }

    if (data.replyTo) {
      formData.append("replyTo", data.replyTo);
    }

    const response = await fetch(
      `${API_URL}/chat/${data.groupId}/messages/media`,
      {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to send media");
    }

    const result = await response.json();
    return result.data;
  },

  markAsRead: async (groupId: string, messageIds: string[]): Promise<void> => {
    const token = await storage.getItem("token");
    const response = await fetch(`${API_URL}/chat/${groupId}/messages/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ messageIds }),
    });

    if (!response.ok) {
      throw new Error("Failed to mark messages as read");
    }
  },

  deleteMessage: async (groupId: string, messageId: string): Promise<void> => {
    const token = await storage.getItem("token");
    const response = await fetch(
      `${API_URL}/chat/${groupId}/messages/${messageId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete message");
    }
  },
};

// Query keys
const chatKeys = {
  all: ["chat"] as const,
  groups: () => [...chatKeys.all, "groups"] as const,
  group: (groupId: string) => [...chatKeys.groups(), groupId] as const,
  messages: (groupId: string) =>
    [...chatKeys.group(groupId), "messages"] as const,
};

// Custom hooks
export const useChatMessages = (groupId: string, enabled = true) => {
  return useQuery({
    queryKey: chatKeys.messages(groupId),
    queryFn: () => chatAPI.getMessages(groupId),
    enabled: enabled && !!groupId,
    staleTime: 0, // Always fetch fresh data
    refetchOnWindowFocus: false,
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendMessage,
    onSuccess: (data, variables) => {
      
    },
  });
};

export const useSendMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: chatAPI.sendMedia,
    onSuccess: (data, variables) => {
      
    },
  });
};

export const useMarkAsRead = () => {
  return useMutation({
    mutationFn: ({
      groupId,
      messageIds,
    }: {
      groupId: string;
      messageIds: string[];
    }) => chatAPI.markAsRead(groupId, messageIds),
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      messageId,
    }: {
      groupId: string;
      messageId: string;
    }) => chatAPI.deleteMessage(groupId, messageId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(variables.groupId),
      });
    },
  });
};

// Main chat hook with real-time functionality
export const useChat = (groupId: string, currentUserId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch initial messages
  const {
    data: initialData,
    isLoading,
    error: fetchError,
  } = useChatMessages(groupId);

  // Initialize messages from API
  useEffect(() => {
    if (initialData?.data) {
      setMessages(initialData.data);
    }
  }, [initialData]);

  // Socket connection and event handlers
  useEffect(() => {
    if (!groupId) return;

    const connectAndJoin = async () => {
      try {
        await socketService.connect();
        console.log(" Socket connected");
        await socketService.joinGroup(groupId);
        console.log(" Joined group:", groupId);
        setIsConnected(true);
        setError(null);

        // Set up event listeners after successful connection
        setupEventListeners();
      } catch (err) {
        console.error("Failed to connect to chat:", err);
        setError("Failed to connect to chat");
        setIsConnected(false);
      }
    };

    // Event handlers
    const handleNewMessage = (message: ChatMessage) => {
      console.log(" NEW MESSAGE RECEIVED ON CLIENT:", message);
      console.log("Current messages count:", messages.length);
      setMessages((prev) => {
        console.log("Previous messages:", prev.length);
        // Check if this is a real message replacing an optimistic one
        const optimisticIndex = prev.findIndex(
          (m) =>
            m._id.startsWith("temp-") &&
            m.senderId === message.senderId &&
            m.message === message.message &&
            Math.abs(
              new Date(m.createdAt).getTime() -
                new Date(message.createdAt).getTime()
            ) < 5000 // Within 5 seconds
        );

        if (optimisticIndex !== -1) {
          // Replace optimistic message with real message
          const newMessages = [...prev];
          newMessages[optimisticIndex] = message;
          return newMessages;
        }

        // Avoid duplicates for regular messages
        if (prev.some((m) => m._id === message._id)) {
          console.log("Duplicate message, ignoring");
          return prev;
        }

        // Add new message
        console.log("Adding new message");
        return [...prev, message];
      });
    };

    const handleUserTyping = (data: TypingUser) => {
      setTypingUsers((prev) => {
        const filtered = prev.filter((user) => user.userId !== data.userId);
        if (data.isTyping) {
          return [...filtered, data];
        }
        return filtered;
      });
    };

    const handleMessageDeleted = (data: {
      messageId: string;
      groupId: string;
    }) => {
      if (data.groupId === groupId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
      }
    };

    const handleError = (error: { message: string }) => {
      setError(error.message);
    };

    const setupEventListeners = () => {
      console.log(" Setting up event listeners after connection");
      socketService.onNewMessage(handleNewMessage);
      socketService.onUserTyping(handleUserTyping);
      socketService.onMessageDeleted(handleMessageDeleted);
      socketService.onError(handleError);
    };

    connectAndJoin();

    return () => {
      // Cleanup
      console.log(" Cleaning up event listeners");
      socketService.offNewMessage(handleNewMessage);
      socketService.offUserTyping(handleUserTyping);
      socketService.offMessageDeleted();
      socketService.offError(handleError);
      socketService.leaveGroup(groupId);
    };
  }, [groupId]);

  // Send message function with optimistic update
  const sendMessage = useCallback(
    async (message: string, replyTo?: string) => {
      if (!groupId || !message.trim()) return;

      try {
        // Get current user data for optimistic update
        const userData = await storage.getItem("userData");
        const currentUser = userData ? JSON.parse(userData) : null;

        if (currentUser && currentUserId) {
          // Create optimistic message using the passed currentUserId to ensure consistency
          const optimisticMessage: ChatMessage = {
            _id: `temp-${Date.now()}`, // Temporary ID
            groupId,
            senderId: currentUserId, // Use the passed currentUserId instead of currentUser.id
            senderName: `${currentUser.firstName} ${currentUser.lastName}`,
            message: message.trim(),
            messageType: "text",
            isEdited: false,
            readBy: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...(replyTo && {
              replyTo: {
                _id: replyTo,
                message: "",
                senderName: "",
                createdAt: "",
              },
            }),
          };

          // Add optimistic message immediately
          setMessages((prev) => [...prev, optimisticMessage]);
        }

        // Send message via socket
        socketService.sendMessage(groupId, message.trim(), replyTo);
      } catch (err) {
        console.error("Failed to send message:", err);
        setError("Failed to send message");
      }
    },
    [groupId]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!groupId) return;

      socketService.sendTyping(groupId, isTyping);

      // Auto-stop typing after 3 seconds
      if (isTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          socketService.sendTyping(groupId, false);
        }, 3000);
      }
    },
    [groupId]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    (messageIds: string[]) => {
      if (!groupId || messageIds.length === 0) return;

      socketService.markMessagesAsRead(groupId, messageIds);
    },
    [groupId]
  );

  return {
    messages,
    typingUsers,
    isConnected,
    isLoading,
    error: error || fetchError?.message,
    sendMessage,
    sendTyping,
    markAsRead,
  };
};

// Export types
export type { ChatMessage, TypingUser, SendMessageData, SendMediaData };
