const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    unique: true,
  },
  lastName: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  graduationYear: {
    type: String,
    required: true,
  },
  educationLevel: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const Users = mongoose.model("User", userSchema);

module.exports = Users;
