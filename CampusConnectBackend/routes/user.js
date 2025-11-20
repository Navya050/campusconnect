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

    const query = { isActive: true };
        query.category = req.body.category;
        query.educationLevel = req.body.educationLevel;
        query.graduationYear = req.body.graduationYear;
    
        const group = await Group.find(query)
          .populate("students", "firstName lastName email")
          .sort({ createdAt: -1 });

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

// Update user profile
router.put("/profile/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      firstName,
      lastName,
      email,
      graduationYear,
      educationLevel,
      category,
    } = req.body;

    // Check if email is being changed and if it already exists
    if (email) {
      const existingUser = await User.findOne({
        email: email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        graduationYear,
        educationLevel,
        category,
      },
      {
        new: true, // Return updated document
        runValidators: true, // Run schema validators
      }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove password from response
    const userResponse = updatedUser.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userResponse,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    if (error.code === 11000) {
      // Handle duplicate key error
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
});

module.exports = router;
