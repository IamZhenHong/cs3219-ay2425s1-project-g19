const express = require('express');
const router = express.Router();
const {
  createRoom,
  getRoomInfo,
  joinRoom,
  leaveRoom
} = require('../controllers/roomControllers');

const {
  askCopilot
} = require('../controllers/copilotControllers');

router.post('/', askCopilot);

router.post('/create', createRoom);
router.get('/:roomId', getRoomInfo);
router.post('/:roomId/join', joinRoom);
router.post('/:roomId/leave', leaveRoom);

module.exports = router;