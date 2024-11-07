const { sendToQueue } = require("../mq");

const askCopilot = async (req, res) => {

    const { code, prompt, type, roomId } = req.body;
    console.log(`Received request to ask Copilot for prompt: ${prompt}`);

    sendToQueue({ code, prompt, type, roomId });

    res.status(200).send({ status: 'Request received. Waiting for Copilot response.' });

};

module.exports = {
    askCopilot,
};