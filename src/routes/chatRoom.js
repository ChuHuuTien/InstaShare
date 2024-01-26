const express = require('express');
const router = express.Router();

const roomController = require('../controllers/chatRoom');

router.get('/',roomController.getRecentConversation);
router.get('/all',roomController.getAllChatRooms);
router.get('/:roomId',roomController.getConversationByRoomId);
router.post('/initate',roomController.initiate);
router.post('/:roomId/message',roomController.postMessage);
router.delete('/:roomId/message',roomController.deleteMessage);


module.exports = router;
