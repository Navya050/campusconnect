const app = require("./app.js");
const http = require("http");
const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");
const ChatMessage = require("./models/chatMessage");
const Group = require("./models/group");
const User = require("./models/user");
const createDebug = require("debug");

const debug = createDebug("node-ng");

const normalizePort = (val) => {
  const port = parseInt(val, 10);
  return isNaN(port) ? val : port >= 0 ? port : false;
};

const onError = (err) => {
  if (err.syscall !== "listen") {
    throw err;
  }
  const bind = typeof addr === "string" ? "pipe " + addr : "port " + port;
  switch (err) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      break;
    default:
      throw err;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Socket.IO is ready for connections`);
};

const port = normalizePort(process.env.PORT || "3406");
app.set("port", port);

const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    console.log("Socket authentication attempt");
    console.log("Auth data:", socket.handshake.auth);

    const token = socket.handshake.auth.token;
    if (!token) {
      console.error("No token provided in socket handshake");
      return next(new Error("No authentication token provided"));
    }

    console.log("Token received, verifying...");

    if (!process.env.SECRET_KEY) {
      console.error("SECRET_KEY not found in environment variables");
      return next(new Error("Server configuration error"));
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    console.log("Token decoded successfully:", { userId: decoded.userId });

    const user = await User.findById(decoded.userId);
    if (!user) {
      console.error("User not found in database:", decoded.userId);
      return next(new Error("User not found"));
    }

    console.log("User found:", {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
    });

    socket.userId = decoded.userId;
    socket.user = user;
    next();
  } catch (error) {
    console.error("Socket authentication error:", error.message);
    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid authentication token"));
    } else if (error.name === "TokenExpiredError") {
      return next(new Error("Authentication token expired"));
    }
    next(new Error("Authentication failed"));
  }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log(`User ${socket.user.firstName} connected: ${socket.id}`);

  // Join group rooms
  socket.on("join-group", async (groupId) => {
    try {
      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (group && group.students.includes(socket.userId)) {
        socket.join(`group-${groupId}`);
        console.log(`User ${socket.user.firstName} joined group ${groupId}`);

        // Notify others in the group
        socket.to(`group-${groupId}`).emit("user-joined", {
          userId: socket.userId,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
        });
      }
    } catch (error) {
      console.error("Error joining group:", error);
    }
  });

  // Leave group rooms
  socket.on("leave-group", (groupId) => {
    socket.leave(`group-${groupId}`);
    console.log(`User ${socket.user.firstName} left group ${groupId}`);

    // Notify others in the group
    socket.to(`group-${groupId}`).emit("user-left", {
      userId: socket.userId,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
    });
  });

  // Handle new messages
  socket.on("send-message", async (data) => {
    try {
      const { groupId, message, replyTo } = data;
      console.log(
        "Message received from:",
        socket.user.firstName,
        "Group:",
        groupId
      ); // Add this

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.students.includes(socket.userId)) {
        socket.emit("error", { message: "Not authorized to send message" });
        return;
      }

      const senderName = `${socket.user.firstName} ${socket.user.lastName}`;

      const chatMessage = new ChatMessage({
        groupId,
        senderId: socket.userId,
        senderName,
        message,
        messageType: "text",
        replyTo: replyTo || null,
      });

      await chatMessage.save();

      // Populate reply if exists
      if (replyTo) {
        await chatMessage.populate("replyTo", "message senderName createdAt");
      }

      // Broadcast to all users in the group
      io.to(`group-${groupId}`).emit("new-message", chatMessage);
      console.log(`Broadcasted to room: group-${groupId}`); // Add this
      console.log(`Roomss user is in:`, Array.from(socket.rooms)); // Add this
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("error", { message: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    const { groupId, isTyping } = data;
    socket.to(`group-${groupId}`).emit("user-typing", {
      userId: socket.userId,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
      isTyping,
    });
  });

  // Handle message read status
  socket.on("mark-read", async (data) => {
    try {
      const { groupId, messageIds } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.students.includes(socket.userId)) {
        return;
      }

      // Update read status
      await ChatMessage.updateMany(
        {
          _id: { $in: messageIds },
          groupId,
          "readBy.userId": { $ne: socket.userId },
        },
        {
          $push: {
            readBy: {
              userId: socket.userId,
              readAt: new Date(),
            },
          },
        }
      );

      // Notify others about read status
      socket.to(`group-${groupId}`).emit("messages-read", {
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        messageIds,
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Handle message deletion
  socket.on("delete-message", async (data) => {
    try {
      const { groupId, messageId } = data;

      // Verify user is member of the group
      const group = await Group.findById(groupId);
      if (!group || !group.students.includes(socket.userId)) {
        socket.emit("error", { message: "Not authorized to delete message" });
        return;
      }

      // Verify user owns the message
      const message = await ChatMessage.findOne({
        _id: messageId,
        groupId,
        senderId: socket.userId,
      });

      if (!message) {
        socket.emit("error", {
          message: "Message not found or not authorized",
        });
        return;
      }

      // Delete the message
      await ChatMessage.findByIdAndDelete(messageId);

      // Notify all users in the group about the deletion
      io.to(`group-${groupId}`).emit("message-deleted", {
        messageId,
        groupId,
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      socket.emit("error", { message: "Failed to delete message" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User ${socket.user.firstName} disconnected: ${socket.id}`);
  });
});

server.on("error", onError);
server.on("listening", onListening);
server.listen(port);
