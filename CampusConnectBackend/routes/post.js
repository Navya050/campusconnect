const express = require("express");
const Posts = require("../models/post");
const Group = require("../models/group");
const User = require("../models/user");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

// Create a new post
router.post("/", checkAuth, async (req, res) => {
  try {
    console.log(req.body);

    // Fetch user data to get the proper name
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const postData = {
      ...req.body,
      author: req.userData.userId,
      authorName: user.firstName + " " + user.lastName,
    };

    const post = new Posts(postData);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    console.log("Error creating post:", error);
    res.status(400).send({ error: error.message });
  }
});

// Get posts with filtering
router.get("/", async (req, res) => {
  try {
    const { mode, groupId, category, userId } = req.query;
    let filter = { isActive: true };

    // Filter by mode (marketplace or study-group)
    if (mode) {
      filter.mode = mode;
    }

    // Filter by group for study-group posts
    if (groupId) {
      filter.groupId = groupId;
    }

    // Filter by category for marketplace posts
    if (category) {
      filter.category = category;
    }

    // If userId is provided, check group membership for study-group posts
    let posts;
    if (userId && mode === "study-group") {
      // Get user's groups
      const userGroups = await Group.find({ students: userId }).select("_id");
      const userGroupIds = userGroups.map((group) => group._id);

      // Filter posts to only show from groups user is member of
      filter.groupId = { $in: userGroupIds };
    }

    posts = await Posts.find(filter)
      .populate("author", "firstName lastName")
      .populate("groupId", "name")
      .sort({ createdAt: -1 });

    res.send(posts);
  } catch (error) {
    console.log("Error fetching posts:", error);
    res.status(500).send({ error: error.message });
  }
});

router.get("/:id", (req, res) => {
  Posts.findById(req.params.id)
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.put("/:id", checkAuth, (req, res) => {
  let post = {};
  console.log("called");
  if (req.body.title) {
    post.title = req.body.title;
  }
  if (req.body.content) {
    post.content = req.body.content;
  }

  Posts.findByIdAndUpdate(req.params.id, post, { new: true })
    .then(() => {
      res.send(post);
    })
    .catch((err) => {
      console.log(err);
    });
});

router.delete("/:id", (req, res) => {
  Posts.findByIdAndDelete(req.params.id)
    .then(() => {
      res.send({ success: "true" });
    })
    .catch((err) => {
      console.log(error);
    });
});

// Add a comment to a post
router.post("/:id/comments", checkAuth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    // Fetch user data to get the proper name
    const user = await User.findById(req.userData.userId);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const commentData = {
      content: req.body.content,
      author: req.userData.userId,
      authorName: user.firstName + " " + user.lastName,
    };

    await post.addComment(commentData);
    res.status(201).send(post);
  } catch (error) {
    console.log("Error adding comment:", error);
    res.status(400).send({ error: error.message });
  }
});

// Get a specific post with comments
router.get("/:id/full", async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id)
      .populate("author", "firstName lastName")
      .populate("groupId", "name")
      .populate("comments.author", "firstName lastName");

    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    res.send(post);
  } catch (error) {
    console.log("Error fetching post:", error);
    res.status(500).send({ error: error.message });
  }
});

// Delete a comment from a post
router.delete("/:id/comments/:commentId", checkAuth, async (req, res) => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      return res.status(404).send({ error: "Post not found" });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).send({ error: "Comment not found" });
    }

    // Check if user is the comment author or post author
    if (
      comment.author.toString() !== req.userData.userId &&
      post.author.toString() !== req.userData.userId
    ) {
      return res
        .status(403)
        .send({ error: "Not authorized to delete this comment" });
    }

    await post.removeComment(req.params.commentId);
    res.send(post);
  } catch (error) {
    console.log("Error deleting comment:", error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
