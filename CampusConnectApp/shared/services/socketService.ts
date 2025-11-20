import { io, Socket } from "socket.io-client";
import { config } from "@/shared/config";
import storage from "@/shared/utils/storage";

export interface ChatMessage {
  _id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: "text" | "image" | "file";
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  isEdited: boolean;
  editedAt?: string;
  replyTo?: {
    _id: string;
    message: string;
    senderName: string;
    createdAt: string;
  };
  readBy: Array<{
    userId: string;
    readAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface TypingUser {
  userId: string;
  userName: string;
  isTyping: boolean;
}

class SocketService {
  private socket: Socket | null = null;
  private currentGroupId: string | null = null;

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      const token = await storage.getItem("token");
      console.log(
        "Retrieved token for socket connection:",
        token ? "Token exists" : "No token found"
      );

      if (!token) {
        throw new Error("No authentication token found. Please login first.");
      }

      // Remove /api from the URL for Socket.IO connection
      const socketUrl = config.API_URL.replace("/api", "");
      console.log("Connecting to socket URL:", socketUrl);

      this.socket = io(socketUrl, {
        auth: {
          token: token.trim(), // Ensure no whitespace
        },
        transports: ["websocket", "polling"],
        timeout: 10000,
        forceNew: true,
      });

      return new Promise<void>((resolve, reject) => {
        if (!this.socket) return reject(new Error("Socket not initialized"));

        const timeout = setTimeout(() => {
          reject(new Error("Connection timeout"));
        }, 15000);

        this.socket.on("connect", () => {
          clearTimeout(timeout);
          console.log("✅ Successfully connected to server");
          console.log("🔌 Socket ID:", this.socket?.id); // Add this
          console.log("🔌 Socket connected?", this.socket?.connected);
          resolve();
        });

        this.socket.on("connect_error", (error) => {
          clearTimeout(timeout);
          console.error("❌ Socket connection error:", error.message);
          console.error("Error details:", error);
          reject(new Error(`Connection failed: ${error.message}`));
        });

        this.socket.on("error", (error) => {
          console.error("❌ Socket error:", error);
        });

        this.socket.on("disconnect", (reason) => {
          console.log("🔌 Socket disconnected:", reason);
        });
      });
    } catch (error) {
      console.error("❌ Failed to connect to socket:", error);
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      // Leave current group before disconnecting
      if (this.currentGroupId) {
        this.socket.emit("leave-group", this.currentGroupId);
      }
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
      this.currentGroupId = null;
      console.log("🔌 Socket disconnected and cleaned up");
    }
  }

  async joinGroup(groupId: string): Promise<void> {
    if (!this.socket?.connected) {
      await this.connect();
    }

    if (this.currentGroupId === groupId) {
      return;
    }

    // Leave current group if any
    if (this.currentGroupId) {
      this.leaveGroup(this.currentGroupId);
    }

    this.currentGroupId = groupId;
    console.log("📥 Joining group:", groupId); // Add this log
    this.socket?.emit("join-group", groupId);
  }

  leaveGroup(groupId: string): void {
    if (this.socket?.connected) {
      this.socket.emit("leave-group", groupId);
    }
    if (this.currentGroupId === groupId) {
      this.currentGroupId = null;
    }
  }

  sendMessage(groupId: string, message: string, replyTo?: string): void {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    console.log("📤 Sending message to group:", groupId); // Add this log
    this.socket.emit("send-message", {
      groupId,
      message,
      replyTo,
    });
  }

  deleteMessage(groupId: string, messageId: string): void {
    if (!this.socket?.connected) {
      throw new Error("Socket not connected");
    }

    this.socket.emit("delete-message", {
      groupId,
      messageId,
    });
  }

  sendTyping(groupId: string, isTyping: boolean): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("typing", {
      groupId,
      isTyping,
    });
  }

  markMessagesAsRead(groupId: string, messageIds: string[]): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit("mark-read", {
      groupId,
      messageIds,
    });
  }

  // Event listeners
  onNewMessage(callback: (message: ChatMessage) => void): void {
    if (!this.socket) {
      console.error("❌ Socket not initialized!");
      return;
    }

    if (!this.socket.connected) {
      console.error("❌ Socket not connected!");
      return;
    }

    console.log("👂 Setting up listener for 'new-message' event");
    console.log("🔌 Socket connected?", this.socket.connected);
    console.log("🔌 Socket ID:", this.socket.id);

    this.socket.off("new-message");

    // Test listener
    this.socket.on("new-message", (data) => {
      console.log("📨📨📨 RAW EVENT RECEIVED:", data);
      callback(data);
    });
  }

  onUserJoined(
    callback: (data: { userId: string; userName: string }) => void
  ): void {
    this.socket?.on("user-joined", callback);
  }

  onUserLeft(
    callback: (data: { userId: string; userName: string }) => void
  ): void {
    this.socket?.on("user-left", callback);
  }

  onUserTyping(callback: (data: TypingUser) => void): void {
    this.socket?.on("user-typing", callback);
  }

  onMessagesRead(
    callback: (data: {
      userId: string;
      userName: string;
      messageIds: string[];
    }) => void
  ): void {
    this.socket?.on("messages-read", callback);
  }

  onError(callback: (error: { message: string }) => void): void {
    this.socket?.on("error", callback);
  }

  onMessageDeleted(
    callback: (data: { messageId: string; groupId: string }) => void
  ): void {
    this.socket?.on("message-deleted", callback);
  }

  // Remove event listeners
  offNewMessage(callback?: (message: ChatMessage) => void): void {
    this.socket?.off("new-message", callback);
  }

  offUserJoined(
    callback?: (data: { userId: string; userName: string }) => void
  ): void {
    this.socket?.off("user-joined", callback);
  }

  offUserLeft(
    callback?: (data: { userId: string; userName: string }) => void
  ): void {
    this.socket?.off("user-left", callback);
  }

  offUserTyping(callback?: (data: TypingUser) => void): void {
    this.socket?.off("user-typing", callback);
  }

  offMessagesRead(
    callback?: (data: {
      userId: string;
      userName: string;
      messageIds: string[];
    }) => void
  ): void {
    this.socket?.off("messages-read", callback);
  }

  offError(callback?: (error: { message: string }) => void): void {
    this.socket?.off("error", callback);
  }

  offMessageDeleted(
    callback?: (data: { messageId: string; groupId: string }) => void
  ): void {
    this.socket?.off("message-deleted", callback);
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get currentGroup(): string | null {
    return this.currentGroupId;
  }
}

// Export singleton instance
export const socketService = new SocketService();
export default socketService;
