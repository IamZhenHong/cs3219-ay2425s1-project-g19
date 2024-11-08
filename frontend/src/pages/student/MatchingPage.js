import React, { useState, useEffect, useContext, useCallback } from "react";
import MatchForm from "../../components/student/MatchForm";
import { getMatch, cancelMatch } from "../../api/MatchingApi";
import { getUserByEmail } from "../../api/UserApi";
import { getQuestionByCriteria } from "../../api/QuestionsApi";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/utils/Loader";
import Modal from "../../components/student/Modal";

const timeout = 30; // Timeout value in seconds
const MATCHING_WS_URL = process.env.REACT_APP_MATCHING_WS_URL || "ws://localhost:8002/ws-matching";

const MatchingPage = () => {
  const [status, setStatus] = useState("");
  const [ws, setWs] = useState(null);
  const [countdown, setCountdown] = useState(timeout);
  const [isMatching, setIsMatching] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userEmail } = useContext(UserContext);
  
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(null); 

  const navigate = useNavigate();

  // Fetch question based on difficulty and category
  const fetchQuestion = useCallback(async (difficulty, category) => {
    try {
      setLoading(true);
      const response = await getQuestionByCriteria(difficulty, category);
      setQuestion(response.data); // Store in state for other uses
      setLoading(false);
      return response.data; // Return the fetched question
    } catch (err) {
      setError("Failed to load the question.");
      setLoading(false);
      return null; // Return null in case of error
    }
  }, []);

  useEffect(() => {
    if (userEmail) {
      localStorage.setItem("userEmail", userEmail);
    }
  }, [userEmail]);

  useEffect(() => {
    const storedEmail = userEmail || localStorage.getItem("userEmail");

    if (storedEmail) {
      setIsLoading(true);
      setStatus(""); 

      async function fetchUser() {
        try {
          const userData = await getUserByEmail(storedEmail);
          if (userData && userData.data) {
            setCurrentUserInfo(userData.data);
          } else {
            setStatus("User data not available. Please try again later.");
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setStatus("Error loading user data. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      }

      fetchUser();
    } else {
      setStatus("No user email provided. Please log in.");
      setIsLoading(false);
    }
  }, [userEmail]);

  const handleMatchRequest = useCallback(
    async (submission) => {
      if (!currentUserInfo || !currentUserInfo.id) {
        setStatus("User information not loaded. Please try again.");
        return;
      }
  
      // // Convert the category array into a comma-separated string
      // const categoryString = Array.isArray(submission.category) 
      //   ? submission.category.join(',') 
      //   : submission.category;  // Handle case if category is already a string
      // console.log(categoryString);
      // console.log(submission.difficulty);
      
      // // Fetch the question and wait for the response
      // const fetchedQuestion = await fetchQuestion(submission.difficulty, categoryString);

      // // Check if a question exists
      // if (!fetchedQuestion) {
      //   // If no question, show an alert or dialog box
      //   alert("No question found for the selected criteria. Please change your choices.");
      //   setStatus("No question available. Please change your criteria.");
      //   return;
      // }
  
      setStatus("Finding a match...");
      setCountdown(timeout);
      setIsMatching(true);
      setIsModalOpen(true);

      const closeWebSocket = () => {
        return new Promise((resolve) => {
          if (ws) {
            ws.onclose = () => {
              console.log("Previous WebSocket closed.");
              resolve();
            };
            ws.close();
          } else {
            resolve();
          }
        });
      };
  
      try {
        const data = {
          userId: currentUserInfo.id,
          category: submission.category,  // Send the converted string
          difficulty: submission.difficulty,
        };
  
        const res = await getMatch(data);
        await closeWebSocket();

        const websocket = new WebSocket(MATCHING_WS_URL);
        websocket.onopen = () => {
          websocket.send(JSON.stringify({ userId: res.userId }));
        };
  
        websocket.onmessage = (message) => {
          const result = JSON.parse(message.data);
          if (result.status === "MATCH_FOUND") {
            setStatus(
              `Match found! You are paired with user ${result.matchedUserId}`
            );
            // Navigate to collaboration room, passing the question and user information
            navigate(`/room/${result.roomId}`, {
              state: {
                difficulty: submission.difficulty,
                category: submission.category,  // Pass the string representation of categories
                userId: currentUserInfo.id,
                matchedUserId: result.matchedUserId,
                // question: fetchedQuestion, // Pass the selected question directly from the response
              },
            });
            setIsMatching(false);
          } else if (result.status === "timeout") {
            setStatus("No match found. Please try again.");
            setIsMatching(false);
          } else if (result.status === "CANCELLED") {
            setStatus("Matching process was cancelled.");
            setIsMatching(false);
          }
        };
  
        websocket.onerror = (error) => {
          setStatus("Error occurred. Please try again.");
          setIsMatching(false);
        };
  
        websocket.onclose = () => {
          setWs(null);
        };
  
        setWs(websocket);
      } catch (err) {
        setStatus("Error sending request. Please try again.");
        setIsMatching(false);
      }
    },
    [currentUserInfo, ws, navigate, fetchQuestion]
  );
  

  const handleCancelRequest = async () => {
    const data = { status: "cancel", userId: currentUserInfo.id };
    const res = await cancelMatch(data)
    if (ws) {
      ws.send(JSON.stringify({ userId: currentUserInfo.id, action: "cancel" }));
      setStatus("Cancelled match request...");
      ws.close();
      setWs(null);
    }
    setIsMatching(false);
    setCountdown(timeout); // Reset countdown
    setIsModalOpen(false); // Close the modal
  };

  useEffect(() => {
    let intervalId;
    if (isMatching) {
      intervalId = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(intervalId);
            setIsMatching(false);
            setStatus("No match found. Please try again.");
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMatching]);

  useEffect(() => {
    return () => {
      if (ws) ws.close();
    };
  }, [ws]);

  if (isLoading) {
    return <div>Loading user information...</div>;
  }

  return (
    <div className="Matching flex flex-col w-full h-full bg-[#000000]">
      <MatchForm onSubmit={handleMatchRequest} />
      {isModalOpen && (
        <Modal open={isModalOpen} onClose={handleCancelRequest}>
          <div className="flex flex-col items-center justify-center my-20">
            {isMatching && <Loader/>}
            
            <p className="text-lg font-regular m-2">
              {status}
            </p>
            
            {isMatching && 
              <p className="text-lg font-regular mb-2">
                Time remaining: {countdown} seconds
              </p>
            }
            
            <button onClick={handleCancelRequest} className="btn btn-danger">
              {isMatching ? "Cancel Matching" : "Exit"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MatchingPage;
