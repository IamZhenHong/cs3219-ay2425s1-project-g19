import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useLocation } from "react-router-dom";
import ChatHeader from "../../components/chat/ChatHeader.js";
import Text from "../../components/chat/Text.js";
import TextInput from "../../components/chat/TextInput.js";

const languages = [
  { label: "JavaScript", value: "javascript" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "HTML", value: "html" },
];

const COLLABORATION_WS_URL = process.env.REACT_APP_COLLABORATION_WS_URL || "ws://localhost:8003/ws-collaboration";

const CollaborationRoom = () => {
  const [status, setStatus] = useState("Connecting...");
  const { roomId } = useParams();
  // const [userId, setUserId] = useState(
  //   `user-${Math.random().toString(36).substr(2, 9)}`
  // ); // Create a unique user ID.
  const [message, setMessage] = useState(""); // Track the input message
  const [messages, setMessages] = useState([]); // Store all chat messages
  const location = useLocation();
  const { difficulty, category, userId, matchedUserId } = location.state || {};

  // Generate the userId only once when the component is first mounted
  // const userId = useRef(`user-${Math.random().toString(36).substr(2, 9)}`).current;

  const [ws, setWs] = useState(null); // Manage the WebSocket connection here.
  const [code, setCode] = useState("// Start coding...");
  const [language, setLanguage] = useState("javascript");

  const monacoRef = useRef(null); // Store reference to Monaco instance
  const editorRef = useRef(null); // Store reference to Monaco Editor instance

  // Store the cursor positions of other users
  const [userCursors, setUserCursors] = useState({});

  // Create a WebSocket connection when the component mounts.
  useEffect(() => {
    const websocket = new WebSocket(COLLABORATION_WS_URL);

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
    };

    websocket.onmessage = (message) => {
      console.log("Received message:", message.data);
      const result = JSON.parse(message.data);

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
      } else if (result.type === "CODE_UPDATE") {
        setCode(result.code);
      } else if (result.type === "CREATE_FAILURE") {
        setStatus(`Failed to create room: ${result.message}`);
      } else if (result.type === "LANGUAGE_CHANGE") {
        setLanguage(result.language);
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

  // Handle cursor position updates and send them to the WebSocket server
  const onLanguageChange = (language) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "LANGUAGE_CHANGE",
          roomId: roomId,
          language: language,
          userId: userId,
        })
      );
    }
  };

  // // Save reference to Monaco editor and set up cursor position listener
  // const handleEditorDidMount = (editor, monaco) => {
  //   editorRef.current = editor;
  //   monacoRef.current = monaco; // Save monaco instance for later use

  //   // Listen for cursor position changes
  //   editor.onDidChangeCursorPosition((event) => {
  //     const position = editor.getPosition(); // { lineNumber, column }
  //     onCursorChange(position); // Send the new cursor position to the WebSocket server
  //   });
  // };

  // // Display the other users' cursor positions
  // const renderUserCursors = () => {
  //   const editor = editorRef.current;
  //   const monaco = monacoRef.current;
  //   if (!editor || !monaco) return null;

  //   Object.keys(userCursors).forEach((userId) => {
  //     const cursorPosition = userCursors[userId];
  //     if (cursorPosition) {
  //       const { lineNumber, column } = cursorPosition;

  //       // Add a decoration for other users' cursor positions
  //       editor.deltaDecorations([], [{
  //         range: new monaco.Range(lineNumber, column, lineNumber, column),
  //         options: {
  //           className: 'other-user-cursor',
  //           isWholeLine: false
  //         }
  //       }]);
  //     }
  //   });
  // };

  // useEffect(() => {
  //   if (editorRef.current) {
  //     renderUserCursors();
  //   }
  // }, [userCursors]);

  const sendMessage = (event) => {
    event.preventDefault();
    if (ws && message) {
      ws.send(
        JSON.stringify({
          type: "SEND_MESSAGE",
          roomId,
          userId,
          message,
        })
      );
      setMessage(""); // Clear the message input
    }
  };

  console.log("Message:", message);
  console.log("Messages:", messages);

  return (
    <div>
      <h1>Collaboration Room: {roomId}</h1>
      <p>Status: {status}</p>
      <div className="flex">
        <div className="questionContainer flex-1">Questions</div>
        <div
          className="flex-1 flex flex-col"
          style={{ backgroundColor: "rgb(30, 30, 30)" }}
        >
          <div className="toolbar">
            <label style={{ color: "rgb(255, 255, 255)" }}>
              Select Language:{" "}
            </label>
            <select
              value={language}
              onChange={(e) => {
                setLanguage(e.target.value);
                onLanguageChange(e.target.value); // Call the language change function
              }}
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              height: "80vh",
              border: "1px solid #ddd",
              marginTop: "10px",
            }}
          >
            <Editor
              height="100%"
              language={language}
              value={code}
              // onMount={handleEditorDidMount}
              onChange={onCodeChange}
              theme="vs-dark"
            />
          </div>
        </div>
        <div className="chatMainContainer flex-1">
          <div className="chatContainer flex justify-center items-center h-screen bg-[#1A1A1D] sm:h-full ">
            <div className="container flex-1 flex-col justify-between bg-white h-[60%] w-[35%] sm:w-full sm:h-full md:w-[60%] p-0 relative">
              <ChatHeader roomName={roomId} />
              <Text messages={messages} name={userId} />
              <TextInput
                message={message}
                setMessage={setMessage}
                sendMessage={sendMessage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRoom;
