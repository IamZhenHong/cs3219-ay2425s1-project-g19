const UserModel = require("./user-model.js");
const dotenv = require('dotenv');
dotenv.config();
const { connect } = require("mongoose");

const connectToDB = async () => {
  const mongoDBUri =
    process.env.ENV === "PROD"
      ? process.env.DB_CLOUD_URI
      : process.env.DB_LOCAL_URI;
  await connect(mongoDBUri, {
    serverSelectionTimeoutMS: 5000, // Adjust timeout if needed
  });

};

const createUser = async (username, email, password) => {
  return new UserModel({ username, email, password }).save();
};

const findUserByEmail = async (email) => {
  return UserModel.findOne({ email });
};

const findUserById = async (userId) => {
  return UserModel.findById(userId);
};

const findUserByUsername = async (username) => {
  return UserModel.findOne({ username });
};

const findUserByUsernameOrEmail = async (username, email) => {
  return UserModel.findOne({
    $or: [
      { username }, 
      { email },
    ],
  });
};

const findAllUsers = async () => {
  return UserModel.find();
};

const updateUserById = async (userId, username, email, password) => {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        username,
        email,
        password,
      },
    },
    { new: true } // return the updated user
  );
};

const updateUserPrivilegeById = async (userId, isAdmin) => {
  return UserModel.findByIdAndUpdate(
    userId,
    {
      $set: {
        isAdmin,
      },
    },
    { new: true } // return the updated user
  );
};

const deleteUserById = async (userId) => {
  return UserModel.findByIdAndDelete(userId);
};

const addNewSession = async (userId, sessionData) => {
  await UserModel.findByIdAndUpdate(
    userId,
    {
      $push: {
        sessionHistory: sessionData, // sessionData should contain sessionId, matchedUserId, questionId, startTime, endTime
      },
    },
    { new: true }
  );
};

const updateSessionEndTime = async (userId, sessionId, endTime) => {
  await UserModel.updateOne(
    { _id: userId, "sessionHistory.sessionId": sessionId },
    {
      $set: {
        "sessionHistory.$.endTime": endTime,
      },
    }
  );
};

/**
 * Deletes a specific session from the sessionHistory of a user.
 * @param {String} userId - The ID of the user.
 * @param {String} sessionId - The ID of the session to delete.
 */
const deleteSession = async (userId, sessionId) => {
  try {
    const result = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: {
          sessionHistory: { sessionId: sessionId }, // Remove session with the matching sessionId
        },
      },
      { new: true } // Return the updated document
    );

    if (result) {
      console.log("Session deleted from history:", result);
    } else {
      console.log("User or session not found.");
    }
  } catch (error) {
    console.error("Error deleting session:", error);
  }
};

module.exports = {
  connectToDB,
  createUser,
  findUserByEmail,
  findUserById,
  findUserByUsername,
  findUserByUsernameOrEmail,
  findAllUsers,
  updateUserById,
  updateUserPrivilegeById,
  deleteUserById,
  addNewSession,
  updateSessionEndTime,
  deleteSession,
};
