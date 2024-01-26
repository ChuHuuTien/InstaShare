// utils
const makeValidation = require('@withvoid/make-validation');
// models
const ChatRoomModel  = require('../models/chatroom.js');
const ChatMessageModel = require('../models/chatmessage.js');

const UserModel = require('../models/user.js')


exports.initiate = async (req, res) => {
  try {
    const chatInitiator =  req.user.userid;
    const allUserIds = [...req.body.userIds, chatInitiator];
    const chatRoom = await ChatRoomModel.initiateChat(allUserIds, chatInitiator);
    return res.status(200).json({ success: true, chatRoom });
  } catch (error) {
    return res.status(500).json({ success: false, error: error })
  }
},
exports.postMessage = async (req, res) => {
  try {
    const {roomId} = req.params;
    const validation = makeValidation(types => ({
      payload: req.body,
      checks: {
        messageText: { type: types.string },
      }
    }));
    if (!validation.success) return res.status(400).json({ ...validation });

     const messagePayload = {
      messageText: req.body.messageText,
    };
    const currentLoggedUser = req.user.userid;
    const message = await ChatMessageModel.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
    global.io.sockets.in(roomId).emit('new message', { message: message });
    return res.status(200).json({ success: true, message: message  });
  } catch (error) {
    return res.status(500).json({ success: false, error: error })
  }
},
exports.deleteMessage = async (req, res) => {
  try {
    const {roomId} = req.params;
    const messageid = req.body.messageid;
    const currentLoggedUser = req.user.userid;
    const message = await ChatMessageModel.createPostInChatRoom(roomId, messagePayload, currentLoggedUser);
    global.io.sockets.in(roomId).emit('new message', { message: message });
    return res.status(200).json({ success: true, message: message  });
  } catch (error) {
    return res.status(500).json({ success: false, error: error })
  }
},
// exports.getRecentConversation = async (req, res) => {
//   try {
//     const currentLoggedUser = req.userId;
//     const options = {
//       page: parseInt(req.query.page) || 0,
//       limit: parseInt(req.query.limit) || 10,
//     };
//     const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser);
//     const roomIds = rooms.map(room => room._id);
//     const recentConversation = await ChatMessageModel.getRecentConversation( roomIds, options, currentLoggedUser );
//     return res.status(200).json({ success: true, conversation: recentConversation });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: error })
//   }
// },

exports.getRecentConversation = async (req, res) => {
    try {
      const currentLoggedUser = req.user.userid;
      const recentConversation = await ChatRoomModel.getRecentConversation(currentLoggedUser);
      return res.status(200).json({ success: true, conversation: recentConversation });
    } catch (error) {
      return res.status(500).json({ success: false, error: error })
    }
  },

exports.getAllChatRooms = async (req, res) => {
  try {
    const currentLoggedUser = req.user.userid;
    const rooms = await ChatRoomModel.getChatRoomsByUserId(currentLoggedUser);
    return res.status(200).json({ success: true, rooms: rooms });
  } catch (error) {
    return res.status(500).json({ success: false, error: error })
  }
},

exports.getConversationByRoomId = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await ChatRoomModel.getChatRoomByRoomId(roomId)
    if (!room) {
      return res.status(400).json({
        success: false,
        message: 'No room exists for this id',
      })
    }
    const users = await UserModel.getUserByIds(room.userIds);
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 10,
    };
    const conversation = await ChatMessageModel.getConversationByRoomId(roomId, options);
    return res.status(200).json({
      success: true,
      conversation,
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error });
  }
}