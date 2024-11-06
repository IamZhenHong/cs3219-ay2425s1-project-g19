const express = require('express');
const router = express.Router();
const { pushReq, cancelMatch } = require('../controllers/matchingControllers');

// Matching Service
router.post('/', pushReq); // Ensure pushReq is a function
router.post('/cancel', cancelMatch); // Ensure cancelMatch is a function

module.exports = router;