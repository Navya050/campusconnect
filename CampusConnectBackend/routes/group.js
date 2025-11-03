const express = require("express");
const router = express.Router();
const Group = require("../models/group");

router.post("/:groupId/join", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body; // Get from authenticated user in real app

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        data: "Group not found",
      });
    }

    if (!group.isActive) {
      return res.status(400).json({
        success: false,
        data: "Group is not active",
      });
    }

    await group.addStudent(userId);

    res.status(200).json({
      success: true,
      data: "Successfully joined the group",
      group: {
        id: group._id,
        name: group.name,
      },
    });
  } catch (error) {
    if (error.message === "Group is full") {
      res.status(400).json({
        success: false,
        data: "Group is full",
      });
    } else if (error.message === "Student already registered") {
      res.status(400).json({
        success: false,
        data: "You are already a member of this group",
      });
    } else {
      res.status(500).json({
        success: false,
        data: error.message || "Failed to join group",
      });
    }
  }
});

router.get("/", async (req, res) => {
  try {
    const { category, educationLevel, graduationYear, userId } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (educationLevel) query.educationLevel = educationLevel;
    if (graduationYear) query.graduationYear = graduationYear;

    const groups = await Group.find(query)
      .populate("students", "firstName lastName email")
      .sort({ createdAt: -1 });

    // Mark which groups the user has already joined
    const groupsWithStatus = groups.map((group) => ({
      _id: group._id,
      name: group.name,
      description: group.description,
      category: group.category,
      educationLevel: group.educationLevel,
      graduationYear: group.graduationYear,
      studentCount: group.students.length,
      maxCapacity: group.maxCapacity,
      isFull: group.isFull(),
      isJoined: userId
        ? group.students.some((s) => s._id.toString() === userId)
        : false,
      createdAt: group.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: groupsWithStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: error.message || "Failed to fetch groups",
    });
  }
});

router.post("/:groupId/leave", async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body; // Get from authenticated user in real app

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({
        success: false,
        data: "Group not found",
      });
    }

    await group.removeStudent(userId);

    res.status(200).json({
      success: true,
      data: "Successfully left the group",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: error.message || "Failed to leave group",
    });
  }
});

module.exports = router;
