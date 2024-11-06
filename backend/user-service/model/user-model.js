const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserModelSchema = new Schema({
  username: {
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
  createdAt: {
    type: Date,
    default: Date.now, // Setting default to the current date/time
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
  // Adding sessionHistory field as an array of objects
  sessionHistory: {
    type: [
      {
        sessionId: {
          type: String,
          required: true,
        },
        matchedUserId: {
          type: String,
          required: true,
        },
        questionId: {
          type: String,
          required: true,
        },
        startDate: {
          type: Date,
          default: Date.now, // Set start time to the current date/time by default
        },
      },
    ],
    default: [], // Initialize as an empty array
  },
});

module.exports = mongoose.model("UserModel", UserModelSchema);
