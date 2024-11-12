const axios = require ("axios");
const dotenv = require("dotenv");
dotenv.config();

// Define the base URL for your API
const API_URL =  "http://localhost:8001/questions";

const getQuestionByCriteria = async (difficulty, category) => {
  try {
    const response = await axios.get(`${API_URL}/${difficulty}/${category}`);

    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("Fetch question failed, please try again.");
    }
  } catch (error) {
    console.error("Error fetching question:", error);
    throw error;
  }
};

module.exports = {
  getQuestionByCriteria
};

