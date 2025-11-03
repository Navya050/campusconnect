const express = require("express");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();
const Group = require("../models/group");

router.post("/signup", async (req, res, next) => {
  console.log("called");

  try {
    const hash = await bcrypt.hash(req.body.password, 10);

    const user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hash,
      graduationYear: req.body.graduationYear,
      educationLevel: req.body.educationLevel,
      category: req.body.category,
    });

    const result = await user.save();

    let group = await Group.findOne({
      category: req.body.category,
      educationLevel: req.body.educationLevel,
      graduationYear: req.body.graduationYear,
    });

    if (!group) {
      group = new Group({
        name: `${req.body.category} ${req.body.educationLevel} ${req.body.graduationYear}`,
        description: `Default group for ${req.body.category} ${req.body.educationLevel} students graduating in ${req.body.graduationYear}`,
        category: req.body.category,
        educationLevel: req.body.educationLevel,
        graduationYear: req.body.graduationYear,
      });

      await group.save();
      console.log(`Created new group: ${group.name}`);
    }

    res.status(201).json({
      success: true,
      data: result,
      group: {
        id: group._id,
        name: group.name,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({
        success: false,
        data: "User already exists!",
      });
    } else if (
      error.message === "Group is full" ||
      error.message === "Student already registered"
    ) {
      res.status(400).json({
        success: false,
        data: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        data: error.message || "Signup failed",
      });
    }
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: "Could not find user",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        data: "Invalid password",
      });
    }

    // Create JWT token using the user's ID
    const token = jwt.sign(
      { email: user.email, userId: user._id },
      "secret_this_should_be_longer",
      { expiresIn: "1h" }
    );

    // Return success, token, expiry, and user details
    res.status(200).json({
      success: true,
      token: token,
      expiresIn: 3600,
      user: user,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({
      success: false,
      data: "Server error during login",
    });
  }
});

router.get("/:id", (req, res, next) => {
  User.findOne({ _id: req.params.id })
    .then((response) => {
      res.send(response);
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
