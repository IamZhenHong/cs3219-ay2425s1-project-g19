const { Mistral } = require('@mistralai/mistralai');

const amqp = require('amqplib/callback_api');
const { sendWsMessage, broadcastToRoom } = require('./ws');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const CLOUDAMQP_URL = process.env.CLOUDAMQP_URL;
const LOCAL_RABBITMQ_URL = process.env.LOCAL_RABBITMQ_URL || "amqp://localhost:5672";
const COLLAB_SERVICE_URL = process.env.COLLAB_SERVICE_URL || "http://localhost:8003";

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function checkSubset(parentArray, subsetArray) {
  return subsetArray.every((el) => {
    return parentArray.includes(el)
  });
}

// In-memory store to track unmatched users
let unmatchedUsers = [];

// Function to set up RabbitMQ consumer
const setupConsumer = () => {
  amqp.connect(LOCAL_RABBITMQ_URL, (err, conn) => {
    if (err) {
      console.error('Connection error in consumer.js:', err);
      return;
    }

    conn.createChannel((err, ch) => {
      if (err) throw err;
      const queue = 'collab_queue';
      ch.assertQueue(queue, { durable: false });

      console.log('Listening for messages in RabbitMQ queue for collab...');
      ch.consume(queue, async (msg) => {
        const userRequest = JSON.parse(msg.content.toString());
        console.log('Received user request:', userRequest);
        console.log('User request type:', userRequest.type);
        if (userRequest.status === 'cancel') {
          // Handle cancel request
          const userIndex = unmatchedUsers.findIndex(u => u.userId === userRequest.userId);
          if (userIndex !== -1) {
            console.log(`Cancelling request for user ${userRequest.userId}`);
            clearTimeout(unmatchedUsers[userIndex].timeoutId); // Clear any pending timeout
            unmatchedUsers.splice(userIndex, 1); // Remove user from unmatched list
            sendWsMessage(userRequest.userId, { status: 'CANCELLED' });
            console.log(`Cancelled matching request for user ${userRequest.userId}`);
          } else {
            console.log(`No unmatched request found for user ${userRequest.userId}`);
          }
          sendWsMessage(userRequest.userId, { status: 'CANCELLED' });
          console.log(`Cancelled matching request for user ${userRequest.userId}`);
        } else if (userRequest.type === 'ASK_COPILOT') {
          // Function to make the API call with retry logic

          try {
            const apiKey = process.env.MISTRAL_API_KEY;
            const client = new Mistral({ apiKey: apiKey });
            prompt = userRequest.prompt;
            currentCode = userRequest.code;

            const chatResponse = await client.chat.complete({
              model: 'mistral-large-latest',
              messages: [{ role: 'user', content: currentCode + '\n' + prompt }],
            });
            console.log('Asking Copilot:', chatResponse);

            broadcastToRoom(userRequest.roomId, { type: 'ASK_COPILOT', response: chatResponse.choices[0].message.content });
          } catch (error) {
            console.error("Failed to fetch chat response:", error);
            broadcastToRoom(userRequest.roomId, { type: 'ASK_COPILOT', response: "Error fetching response from assistant." });
          }
        }
        else {
          // Handle match request
          const match = unmatchedUsers.find(u =>
            checkSubset(u.category, userRequest.category) ||
            checkSubset(userRequest.category, u.category)
          ) || unmatchedUsers.find(u => u.difficulty === userRequest.difficulty);

          if (match) {
            try {
              console.log(`Matched user ${userRequest.userId} with user ${match.userId}`);

              // Create room in collaboration service
              const response = await axios.post(`${COLLAB_SERVICE_URL}/rooms/create`, {
                users: [userRequest.userId, match.userId],
                difficulty: userRequest.difficulty,
                category: userRequest.category
              });
              console.log(response.data);
              const { roomId } = response.data;

              // Notify both users
              [userRequest, match].forEach(user => {
                sendWsMessage(user.userId, {
                  status: 'MATCH_FOUND',
                  roomId,
                  matchedUserId: user === userRequest ? match.userId : userRequest.userId,
                  difficulty: userRequest.difficulty,
                  category: userRequest.category
                });
              });

              // Clear the timeouts for both users
              clearTimeout(match.timeoutId);

              // Remove matched user from unmatchedUsers
              unmatchedUsers = unmatchedUsers.filter(u => u.userId !== match.userId);
            } catch (error) {
              console.error('Error creating room:', error);
            }
          } else {
            // Set a timeout to remove unmatched users after 30 seconds
            const timeoutId = setTimeout(() => {
              unmatchedUsers = unmatchedUsers.filter(u => u.userId !== userRequest.userId);
              sendWsMessage(userRequest.userId, { status: 'timeout' });
            }, 30000);  // 30 seconds timeout

            // Add the new user with their timeout ID
            unmatchedUsers.push({ ...userRequest, timeoutId });
          }
        }

        ch.ack(msg);  // Acknowledge message processing
      });
    });
  });
};


module.exports = { setupConsumer };
