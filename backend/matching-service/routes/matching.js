const express = require('express');
const router = express.Router();
const { pushReq, cancelReq } = require('../controllers/matchingControllers');

// Matching Service - Initiate Match
router.post('/', pushReq);

// Matching Service - Cancel Match
router.post('/cancel', cancelReq);

module.exports = router;