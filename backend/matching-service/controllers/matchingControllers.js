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

const cancelReq = async (req, res) => {
    const { userId } = req.body;
    console.log(`Received cancel request from user ${userId}`);

    try {
        // Send a cancel message to RabbitMQ
        sendToQueue({ userId, action: 'cancel' });

        // Send response to the frontend
        res.status(200).send({ status: 'Match request canceled successfully.', userId });
    } catch (error) {
        console.error("Failed to cancel match request:", error);
        res.status(500).send({ status: 'Failed to cancel match request.', error: error.message });
    }
};

// Export both functions
module.exports = { pushReq, cancelReq };