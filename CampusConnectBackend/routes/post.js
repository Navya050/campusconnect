const express = require("express");
const Posts = require("../models/post");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.post("/", checkAuth, async (req, res) => {
  try {
    console.log(req.body);
    const post = new Posts(req.body);
    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.get("/", (req, res) => {
  Posts.find()
    .then((posts) => {
      res.send(posts);
    })
    .catch((err) => {
      console.log(err);
    });
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

module.exports = router;
