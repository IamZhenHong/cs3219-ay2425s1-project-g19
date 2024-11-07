import axios from "axios";

const MATCHING_API_URL = process.env.REACT_APP_MATCHING_API_URL || "http://localhost:8002/matching";

export const getMatch = async (data) => {
  try {
    const response = await axios.post(MATCHING_API_URL, data);
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error("No match found.");
    }
  } catch (error) {
    if (error.response) {
        console.error("Error finding match:", error.response.data);
        throw new Error(error.response.data.message);
      }
      console.error("Error finding match:", error);
      throw error; // Re-throw the error to handle it in the component
  }
};

// Function to cancel a match
export const cancelMatch = async (data) => {
  const CANCEL_MATCHING_API_URL = `${MATCHING_API_URL}/cancel`; // Define the cancel endpoint
  try {
    const response = await axios.post(CANCEL_MATCHING_API_URL,  data );
    if (response.status === 200) {
      return response.data; // Return the response data if the cancellation is successful
    } else {
      throw new Error("Cancellation failed.");
    }
  } catch (error) {
    if (error.response) {
      console.error("Error canceling match:", error.response.data);
      throw new Error(error.response.data.message);
    }
    console.error("Error canceling match:", error);
    throw error; // Re-throw the error to handle it in the component
  }
};