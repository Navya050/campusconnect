const mongoose = require("mongoose");

// Comment schema for nested comments
const commentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const postsSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // Image stored as base64 string
  image: {
    type: String,
    required: false,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  // Mode to differentiate between marketplace and study group posts
  mode: {
    type: String,
    enum: ["marketplace", "study-group"],
    required: true,
  },
  // For study group posts - which group it belongs to
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: function () {
      return this.mode === "study-group";
    },
  },
  // For marketplace posts - category
  category: {
    type: String,
    required: function () {
      return this.mode === "marketplace";
    },
  },
  // Comments/sub-posts
  comments: [commentSchema],
  // Metadata
  tags: [
    {
      type: String,
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
postsSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for comment count
postsSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Method to add a comment
postsSchema.methods.addComment = function (commentData) {
  this.comments.push(commentData);
  return this.save();
};

// Method to remove a comment
postsSchema.methods.removeComment = function (commentId) {
  this.comments = this.comments.filter(
    (comment) => !comment._id.equals(commentId)
  );
  return this.save();
};

const Posts = mongoose.model("posts", postsSchema);

module.exports = Posts;
