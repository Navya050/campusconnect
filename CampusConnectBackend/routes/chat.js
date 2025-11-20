const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ChatMessage = require("../models/chatMessage");
const Group = require("../models/group");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/chat";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip|rar/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

// Get chat messages for a group
router.get("/:groupId/messages", checkAuth, async (req, res) => {
  try {
    const { groupId } = req.params;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!group.students.includes(req.userData.userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    const messages = await ChatMessage.find({ groupId })
      .populate("replyTo", "message senderName createdAt")
      .sort({ createdAt: -1 })
      .lean();

    // Reverse to get chronological order
    messages.reverse();

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
});

// Send a text message
router.post("/:groupId/messages", checkAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message, replyTo } = req.body;
    const userId = req.userData.userId;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!group.students.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Get sender name
    const User = require("../models/user");
    const user = await User.findById(userId);
    const senderName = `${user.firstName} ${user.lastName}`;

    const chatMessage = new ChatMessage({
      groupId,
      senderId: userId,
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

    res.status(201).json({
      success: true,
      data: chatMessage,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});

// Upload media message
router.post(
  "/:groupId/messages/media",
  checkAuth,
  upload.single("media"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const { message, replyTo, mediaData, mediaType, mediaName } = req.body;
      const userId = req.userData.userId;

      // Check if user is member of the group
      const group = await Group.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: "Group not found",
        });
      }

      if (!group.students.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "You are not a member of this group",
        });
      }

      // Get sender name
      const User = require("../models/user");
      const user = await User.findById(userId);
      const senderName = `${user.firstName} ${user.lastName}`;

      let chatMessage;

      // Handle base64 image data (like market posts)
      if (mediaData && mediaData.startsWith("data:image")) {
        chatMessage = new ChatMessage({
          groupId,
          senderId: userId,
          senderName,
          message: message || "",
          messageType: "image",
          mediaUrl: mediaData, // Store base64 directly
          mediaName: mediaName || `image_${Date.now()}.jpg`,
          replyTo: replyTo || null,
        });
      }
      // Handle file upload (traditional way)
      else if (req.file) {
        // Determine message type based on file
        const isImage = /\.(jpg|jpeg|png|gif)$/i.test(req.file.originalname);
        const messageType = isImage ? "image" : "file";

        chatMessage = new ChatMessage({
          groupId,
          senderId: userId,
          senderName,
          message: message || "",
          messageType,
          mediaUrl: req.file.path,
          mediaName: req.file.originalname,
          mediaSize: req.file.size,
          replyTo: replyTo || null,
        });
      } else {
        return res.status(400).json({
          success: false,
          message: "No media data provided",
        });
      }

      await chatMessage.save();

      // Populate reply if exists
      if (replyTo) {
        await chatMessage.populate("replyTo", "message senderName createdAt");
      }

      res.status(201).json({
        success: true,
        data: chatMessage,
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload media",
      });
    }
  }
);

// Mark messages as read
router.post("/:groupId/messages/read", checkAuth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { messageIds } = req.body;
    const userId = req.userData.userId;

    // Check if user is member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found",
      });
    }

    if (!group.students.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this group",
      });
    }

    // Update read status for messages
    await ChatMessage.updateMany(
      {
        _id: { $in: messageIds },
        groupId,
        "readBy.userId": { $ne: userId },
      },
      {
        $push: {
          readBy: {
            userId,
            readAt: new Date(),
          },
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
    });
  }
});

// Delete a message
router.delete("/:groupId/messages/:messageId", checkAuth, async (req, res) => {
  try {
    const { groupId, messageId } = req.params;
    const userId = req.userData.userId;

    const message = await ChatMessage.findOne({
      _id: messageId,
      groupId,
      senderId: userId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you don't have permission to delete it",
      });
    }

    // Delete associated media file if exists
    if (message.mediaUrl && fs.existsSync(message.mediaUrl)) {
      fs.unlinkSync(message.mediaUrl);
    }

    await ChatMessage.findByIdAndDelete(messageId);

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
    });
  }
});

// Serve uploaded files
router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, "../uploads/chat", filename);

  if (fs.existsSync(filepath)) {
    res.sendFile(path.resolve(filepath));
  } else {
    res.status(404).json({
      success: false,
      message: "File not found",
    });
  }
});

module.exports = router;
