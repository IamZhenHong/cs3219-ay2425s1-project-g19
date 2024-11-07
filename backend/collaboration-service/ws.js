const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { RoomManager } = require("./roomManager");

// Instantiate the RoomManager
const roomManager = new RoomManager();

const wsClients = new Map();

const setupWebSocket = (server) => {
  const wss = new WebSocket.Server({ server, path: '/ws-collaboration' });

  wss.on("connection", (ws) => {
    console.log("New client connected to collaboration service");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        handleMessage(ws, data);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    ws.on("close", () => {
      console.log("User disconnected");
      handleDisconnect(ws);
    });
  });

  return wss;
};

function handleMessage(ws, data) {
  switch (data.type) {
    // case 'CONNECT':
    //   handleConnect(ws, data);
    //   break;

    case "CREATE_ROOM": // Add this case to handle room creation
      handleCreateRoom(ws, data);
      break;

    case "SEND_MESSAGE":
      handleSendMessage(ws, data);
      break;

    case "JOIN_ROOM":
      handleJoinRoom(ws, data);
      break;

    case "CODE_CHANGE":
      handleCodeChange(data);
      break;

    case "LANGUAGE_CHANGE":
      handleLanguageChange(data);
      break;

    case "CURSOR_MOVE":
      handleCursorMove(data);
      break;

    case "LEAVE_ROOM":
      handleLeaveRoom(ws, data);
      break;

    // case "PROMPT_CHANGE":
    //   handlePromptChange(data);
    //   break;

    default:
      console.log("Unknown message type:", data.type);
  }
}

// function handleConnect(ws, data) {
//   console.log('handleConnect:', data);
//   wsClients.set(data.userId, ws);
//   ws.userId = data.userId;
// }

// Function to handle room creation
function handleCreateRoom(ws, data) {
  const { roomId, users, difficulty, category } = data;

  wsClients.set(users[0], ws);
  ws.userId = users[0];

  // Create and store a new room on the server
  const newRoom = roomManager.createRoom(roomId, users, difficulty, category);

  // Send confirmation to the client that room was created successfully
  ws.send(
    JSON.stringify({
      type: "CREATE_SUCCESS",
      message: `Room ${roomId} created successfully`,
      room: newRoom.toJSON(),
    })
  );
}


function handleSendMessage(ws, data) {
  const { roomId, userId, message } = data;
  const room = roomManager.getRoom(roomId);
  if (room) {
    broadcastToRoom(roomId, {
      type: "MESSAGE",
      userId,
      message,
    });
  } else {
    console.error(`Room ${roomId} not found for user ${userId}`);
  }
}

function handleJoinRoom(ws, data) {
  const { roomId, userId } = data;

  // Store the connection for the joining user
  wsClients.set(userId, ws);
  ws.userId = userId;

  const room = roomManager.getRoom(roomId);

  if (room) {
    room.addUser(userId);
    ws.roomId = roomId;

    // Send current room state
    ws.send(
      JSON.stringify({
        type: "ROOM_STATE",
        code: room.code,
        users: Array.from(room.connectedUsers),
      })
    );

    // Notify others in the room
    broadcastToRoom(
      roomId,
      {
        type: "USER_JOINED",
        userId,
        users: Array.from(room.connectedUsers),
      },
      userId
    );

    // Notify the user that they successfully joined
    ws.send(
      JSON.stringify({
        type: "JOIN_SUCCESS",
        message: `Successfully joined room ${roomId}`,
        users: Array.from(room.connectedUsers),
      })
    );
  } else {
    // Notify that the room was not found
    ws.send(
      JSON.stringify({
        type: "JOIN_FAILURE",
        message: `Room ${roomId} not found`,
      })
    );
  }
}

function handleCodeChange(data) {
  const { roomId, code, userId } = data;
  const room = roomManager.getRoom(roomId);

  if (room) {
    room.updateCode(code);
    console.log(`Code updated for room ${roomId}: ${code}`);
    broadcastToRoom(
      roomId,
      {
        type: "CODE_UPDATE",
        code,
        userId,
      },
      userId
    );
  } else {
    console.error(`Room ${roomId} not found for user ${userId}`);
  }
}

function handlePromptChange(data) {
  const { roomId, prompt, userId } = data;
  const room = roomManager.getRoom(roomId);
  if (room) {

    room.updatePrompt(prompt);
    console.log(`Prompt updated for room ${roomId}: ${prompt}`);
    broadcastToRoom
    (
      roomId,
      {
        type: "PROMPT_CHANGE",
        prompt,
        userId
      },
      userId
    );
  } else { 
    console.error(`Room ${roomId} not found for user ${userId}`);
  }
}

function handleCursorMove(data) {
  const { roomId, position, userId } = data;
  broadcastToRoom(
    roomId,
    {
      type: "CURSOR_UPDATE",
      position,
      userId,
    },
    userId
  );
}

function handleLanguageChange(data) {
  const { roomId, language, userId } = data;
  const room = roomManager.getRoom(roomId);

  if (room) {
    console.log(`Language changed for room ${roomId}: ${language}`);
    broadcastToRoom(
      roomId,
      {
        type: "LANGUAGE_CHANGE",
        language,
        userId,
      },
      userId
    );
  } else {
    console.error(`Room ${roomId} not found for user ${userId}`);
  }
}

function handleLeaveRoom(ws, data) {
  const { roomId, userId } = data;
  cleanupRoom(roomId, userId, ws);
}

function handleDisconnect(ws) {
  if (ws.userId) {
    wsClients.delete(ws.userId);

    if (ws.roomId) {
      cleanupRoom(ws.roomId, ws.userId, ws);
    }
  }
}

function cleanupRoom(roomId, userId, ws) {
  const room = roomManager.getRoom(roomId);
  if (room) {
    room.removeUser(userId);

    if (ws) {
      delete ws.roomId;
    }

    broadcastToRoom(
      roomId,
      {
        type: "USER_LEFT",
        userId,
        users: Array.from(room.connectedUsers),
      },
      userId
    );

    if (room.connectedUsers.size === 0) {
      roomManager.deleteRoom(roomId);
    }
  }
}

function broadcastToRoom(roomId, message, excludeUserId = null) {
  const room = roomManager.getRoom(roomId);
  // console.log(room);
  if (room) {
    console.log(
      `Broadcasting message to room: ${roomId}, excluding user: ${excludeUserId}`
    );
    room.connectedUsers.forEach((userId) => {
      if (userId !== excludeUserId) {
        const ws = wsClients.get(userId);
        if (ws) {
          console.log(`Sending message to user: ${userId}`);
          ws.send(JSON.stringify(message));
        } else {
          console.log(`No WebSocket connection found for user: ${userId}`);
        }
      } else {
        console.log(`Skipping user: ${userId} (excluded)`);
      }
    });
  } else {
    console.log(`Room ${roomId} not found`);
  }
}

// Helper function to send a message to a specific user by userId
const sendWsMessage = (userId, message) => {
  const ws = wsClients.get(userId);
  if (ws) {
    ws.send(JSON.stringify(message));
    console.log(`Sent WebSocket message to user ${userId}:`, message);
  } else {
    console.log(`No WebSocket connection found for user ${userId}`);
  }
};


module.exports = {
  setupWebSocket, sendWsMessage, broadcastToRoom
};
