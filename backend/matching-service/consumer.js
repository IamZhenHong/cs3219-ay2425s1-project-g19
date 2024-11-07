const { Mistral } = require('@mistralai/mistralai');


const amqp = require('amqplib/callback_api');
const { sendWsMessage } = require('./ws');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const CLOUDAMQP_URL = process.env.CLOUDAMQP_URL;
const COLLAB_SERVICE_URL = "http://localhost:8003";

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
  amqp.connect(CLOUDAMQP_URL, (err, conn) => {
    if (err) throw err;

    conn.createChannel((err, ch) => {
      if (err) throw err;
      const queue = 'matching_queue';
      ch.assertQueue(queue, { durable: false });

      console.log('Listening for messages in RabbitMQ queue...');
      ch.consume(queue, async (msg) => {
        const userRequest = JSON.parse(msg.content.toString());
        console.log('Received user request:', userRequest);

        if (userRequest.action === 'cancel') {
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
        } else if (userRequest.status === 'askcopilot') {
          // Handle askcopilot request: Call LLM API with the data
          const apiKey = process.env.Mistral_API_KEY;
          const client = new Mistral ({apiKey: apiKey});
          const prompt = userRequest.data.prompt;
          const code = userRequest.data.code;
          model = 'mistral-large-latest'
          chat_response = await client.chat.complete(

            model=model,
            messages=[
                {
                    "role": "system",
                    "content": "You are an experienced developer. Please provide detailed and accurate responses."
                },
                {
                    "role": "user",
                    "content": "Prompt: ${prompt}\nCode: ${code}"
                }
            ]
        )
        
        sendWsMessage(userRequest.userId, { status: 'askcopilot', response: chat_response });
        } else {
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
