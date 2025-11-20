const mongoose = require("mongoose");

const groupSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    graduationYear: {
      type: String,
      required: true,
    },
    educationLevel: {
      type: String,
      enum: ["UG", "PG"],
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    maxCapacity: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.virtual("studentCount").get(function () {
  return this.students.length;
});

groupSchema.methods.isFull = function () {
  if (!this.maxCapacity) return false;
  return this.students.length >= this.maxCapacity;
};

groupSchema.methods.addStudent = function (studentId) {
  if (this.isFull()) {
    throw new Error("Group is full");
  }
  if (this.students.some((id) => id.equals(studentId))) {
    throw new Error("Student already registered");
  }
  this.students.push(studentId);
  return this.save();
};

groupSchema.methods.removeStudent = function (studentId) {
  this.students = this.students.filter((id) => !id.equals(studentId));
  return this.save();
};

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
