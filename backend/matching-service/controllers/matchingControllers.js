const { sendToQueue } = require('../mq');

// @desc    Push req into MQ
// @route   POST /matching
// @access  Public
const pushReq = async (req, res) => {
    const { userId, category, difficulty } = req.body;
    console.log(`Received match request from user ${userId} for category ${category}, difficulty ${difficulty}`);

    // Send message to RabbitMQ
    sendToQueue({ userId, category, difficulty });

    // Send response to the frontend
    res.status(200).send({ status: 'Request received. Waiting for match.', userId });
};

const cancelMatch = async (req, res) => {
    const { status, userId } = req.body; // Extract matchId from request body
    

    sendToQueue({ status, userId });

    res.status(200).send({ status: 'Request received. Cancelling match.' });
  };
  
  // Export your functions
module.exports = {
pushReq,
cancelMatch, // Export the cancelMatch function
};

// module.exports = pushReq;