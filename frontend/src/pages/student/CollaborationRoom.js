import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

const CollaborationRoom = () => {
  const [status, setStatus] = useState("Connecting...");
  const { roomId } = useParams();
  // const [userId, setUserId] = useState(
  //   `user-${Math.random().toString(36).substr(2, 9)}`
  // ); // Create a unique user ID.
  const [ws, setWs] = useState(null); // Manage the WebSocket connection here.
  const [message, setMessage] = useState(""); // Track the input message
  const [messages, setMessages] = useState([]); // Store all chat messages
  const location = useLocation();
  const { difficulty, category, userId, matchedUserId } = location.state || {};

  // Create a WebSocket connection when the component mounts.
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8003");

    let pingInterval;

    websocket.onopen = () => {
      console.log("WebSocket connected.");
      setStatus("Connected to the server.");

      // Send a message to create the room
      websocket.send(
        JSON.stringify({
          type: "CREATE_ROOM",
          roomId: roomId,
          users: [userId, matchedUserId],
          difficulty: difficulty,
          category: category,
        })
      );

      // Start pinging the server to keep connection alive
      pingInterval = setInterval(() => {
        websocket.send(JSON.stringify({ type: "PING" }));
      }, 30000); // Ping every 30 seconds
    };

    websocket.onmessage = (message) => {
      console.log("Received message:", message.data);
      const result = JSON.parse(message.data);
      console.log(result);
      if (result.type === "MESSAGE") {
        // Add the message to the chat
        setMessages((prev) => [
          ...prev,
          { userId: result.userId, message: result.message },
        ]);
        console.log(userId);
      } else if (result.type === "CREATE_SUCCESS") {
        // Room created successfully, now join the room
        websocket.send(
          JSON.stringify({
            type: "JOIN_ROOM",
            roomId,
            userId,
          })
        );
      } else if (result.type === "CREATE_FAILURE") {
        setStatus(`Failed to create room: ${result.message}`);
      } else {
        setStatus(`Received message: ${message.data}`);
      }
    };

    websocket.onerror = (error) => {
      setStatus("WebSocket connection error.");
      console.error("WebSocket error:", error);
    };

    websocket.onclose = (event) => {
      clearInterval(pingInterval); // Clear the ping interval
      setStatus(
        `WebSocket closed: Code = ${event.code}, Reason = ${event.reason}`
      );
      console.log(
        `WebSocket closed: Code = ${event.code}, Reason = ${event.reason}`
      );
    };

    setWs(websocket); // Store the WebSocket connection.

    // Cleanup WebSocket when the component unmounts
    return () => {
      clearInterval(pingInterval); // Clear the ping interval on unmount
      // websocket.close();
    };
  }, []); // Run this effect when the roomId or userId changes.

  const sendMessage = (event) => {
    event.preventDefault();
    console.log(ws, message);
    if (ws && message) {
      console.log(roomId, userId, message);
      ws.send(
        JSON.stringify({
          type: "SEND_MESSAGE",
          roomId,
          userId,
          message,
        })
      );
      console.log("Hello");
      setMessage(""); // Clear the input message
    }
  };

  console.log("Message:", message);
  console.log("Messages:", messages);

  return (
    <div>
      <h1>Collaboration Room: {roomId}</h1>
      <p>Status: {status}</p>
      <div className="chatContainer">
        <div className="container">
          <input
            val={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              event.key === "Enter" && sendMessage(event);
            }}
          ></input>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRoom;
