import React, { useState, useEffect, useRef } from "react";
import Editor from '@monaco-editor/react';
import { useParams, useLocation } from "react-router-dom";

const languages = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "HTML", value: "html" },
];

const CollaborationRoom = () => {
  const [status, setStatus] = useState("Connecting...");
  const { roomId } = useParams();
  const location = useLocation();
  const { difficulty, category, matchedUserId } = location.state || {};

  // Generate the userId only once when the component is first mounted
  const userId = useRef(`user-${Math.random().toString(36).substr(2, 9)}`).current;

  const [ws, setWs] = useState(null); // Manage the WebSocket connection here.
  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState("javascript");

  // Create a WebSocket connection when the component mounts.
  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8003");

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
    };

    websocket.onmessage = (message) => {
      console.log("Received message:", message.data);
      const result = JSON.parse(message.data);
      if (result.type === "CREATE_SUCCESS") {
        // Room created successfully, now join the room
        websocket.send(
          JSON.stringify({
            type: "JOIN_ROOM",
            roomId,
            userId,
          })
        );
      } else if (result.type === "CODE_UPDATE") {
        console.log("receive ${result.code}")
        setCode(result.code); 
      } else if (result.type === "CREATE_FAILURE") {
        setStatus(`Failed to create room: ${result.message}`);
      } 
    };

    websocket.onerror = (error) => {
      setStatus("WebSocket connection error.");
      console.error("WebSocket error:", error);
    };

    websocket.onclose = (event) => {
      setStatus(`WebSocket closed: Code = ${event.code}, Reason = ${event.reason}`);
      console.log(`WebSocket closed: Code = ${event.code}, Reason = ${event.reason}`);
    };

    setWs(websocket); // Store the WebSocket connection.

    // Cleanup WebSocket when the component unmounts
    return () => {
      websocket.close(); // Properly close the WebSocket on unmount to prevent multiple connections
    };
  }, [roomId, matchedUserId, difficulty, category, userId]); // Ensure userId is stable and consistent

  const onCodeChange = (newCode) => {
    setCode(newCode);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "CODE_CHANGE",
          roomId: roomId,
          code: newCode,
          userId: userId,
        })
      );
    }
  };

  return (
    <div>
      <h1>Collaboration Room: {roomId}</h1>
      <p>Status: {status}</p>

      <div className="toolbar">
        <label>Select Language: </label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {languages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ height: "80vh", border: "1px solid #ddd", marginTop: "10px" }}>
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
        />
      </div>
    </div>
  );
};

export default CollaborationRoom;
