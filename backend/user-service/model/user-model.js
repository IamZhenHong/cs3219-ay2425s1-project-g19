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
        sessionId: String,
        matchedUserId: String,
        questionId: String,
        startTime: {
          type: Date,
          default: Date.now, // Set start time to the current date/time by default
        },
        endTime: Date, // End time can be set when the session ends
      },
    ],
    default: [], // Initialize as an empty array
  },
});

module.exports = mongoose.model("UserModel", UserModelSchema);
