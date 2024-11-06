import React, { useState, useEffect, useContext, useCallback } from "react";
import MatchForm from "../../components/student/MatchForm";
import { getMatch, cancelMatch } from "../../api/MatchingApi";
import { getUserByEmail } from "../../api/UserApi";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";

const timeout = 30; // Timeout value in seconds

const MatchingPage = () => {
  const [status, setStatus] = useState("");
  const [ws, setWs] = useState(null);
  const [countdown, setCountdown] = useState(timeout);
  const [isMatching, setIsMatching] = useState(false);
  const [currentUserInfo, setCurrentUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { userEmail } = useContext(UserContext);
  const navigate = useNavigate();

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

      setStatus("Finding a match...");
      setCountdown(timeout);
      setIsMatching(true);

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
          category: submission.category,
          difficulty: submission.difficulty,
        };

        const res = await getMatch(data);
        await closeWebSocket();

        const websocket = new WebSocket("ws://localhost:8002");
        websocket.onopen = () => {
          websocket.send(JSON.stringify({ userId: res.userId }));
        };

        websocket.onmessage = (message) => {
          const result = JSON.parse(message.data);
          if (result.status === "MATCH_FOUND") {
            setStatus(
              `Match found! You are paired with user ${result.matchedUserId}`
            );
            // Navigate to collaboration room
            navigate(`/room/${result.roomId}`, {
              state: {
                difficulty: submission.difficulty,
                category: submission.category,
                userId: currentUserInfo.id,
                matchedUserId: result.matchedUserId
              }
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
    [currentUserInfo, ws, navigate]
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
    <div className="Matching m-[1rem]">
      <h1>Wanna practice coding with your peer?</h1>
      <MatchForm onSubmit={handleMatchRequest} />
      <div className="flex items-center justify-center">
        <p>{status}</p>
        {isMatching && <p>Time remaining: {countdown} seconds</p>}
      </div>
      {isMatching && (
        <button onClick={handleCancelRequest} className="cancel-button">
          Cancel Matching
        </button>
      )}
    </div>
  );
};

export default MatchingPage;
