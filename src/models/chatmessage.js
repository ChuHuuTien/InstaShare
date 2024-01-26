const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const chatMessageSchema = new Schema({
  chatRoomId: {type: Schema.Types.ObjectId, require:true, ref:'channel'},
  postedByUser: { type: Schema.Types.ObjectId, require:true,ref: 'user' },
  message: {type: mongoose.Schema.Types.Mixed},
  type: {type: String, require:true, default: 'text'},
},{
  timestamps: true,
  collection: "chatmessages",
  versionKey: false,
});

/**
 * This method will create a post in chat
 * 
 * @param {String} roomId - id of chat room
 * @param {Object} message - message you want to post in the chat room
 * @param {String} postedByUser - user who is posting the message
 */
chatMessageSchema.statics.createPostInChatRoom = async function (roomId, message, postedByUserId) {
  try {
    const newMessage = await this.create({
      chatRoomId: roomId,
      message,
      postedByUser: postedByUserId,
      readByRecipients: { readByUserId: postedByUserId }
    });
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(newMessage._id)}},
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: '_id',
          pipeline: [{ $project: {_id: 1, firstName:1, lastName: 1, avatarURL:1 }}],
          as: 'postedByUser',
        }
      },
      { $unwind: '$postedByUser' },
      {$project: { updatedAt: 0}},
    ]);
    return aggregate[0];

    return post;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} chatRoomId - chat room id
 */
chatMessageSchema.statics.getConversationByRoomId = async function (roomId, options) {
  try {
    // const rooms = await this.find({chatRoomId: roomId}).lean();
    // return rooms;
    return await this.aggregate([
      { $match: { chatRoomId: new mongoose.Types.ObjectId(roomId) } },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and 
      // get me a user whose _id = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          foreignField: '_id',
          pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL:1 }}],
          as: 'postedByUser',
        }
      },
      { $unwind: "$postedByUser" },
      // apply pagination
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $sort: { createdAt: 1 } },
      { $project: { updatedAt: 0}},
    ]);

  } catch (error) {
    throw error;
  }
}

// const chatRoom = require('./chatroom');
/**
 * @param {String} chatRoomId - chat room id
 * @param {String} currentUserOnlineId - user id
 */
chatMessageSchema.statics.markMessageRead = async function (chatRoomId, currentUserOnlineId) {
  try {
    // const chatRoomAvaiable = chatRoom.getChatRoomsByUserId(currentUserOnlineId);
    // if(chatRoomAvaiable) {}
    return this.updateMany(
      {
        chatRoomId: chatRoomId,
        'readByRecipients.readByUserId': { $ne: currentUserOnlineId }
      },
      {
        $addToSet: {
          readByRecipients: { readByUserId: currentUserOnlineId }
        }
      },
      {
        multi: true
      }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} chatRoomIds - chat room ids
 * @param {{ page, limit }} options - pagination options
 * @param {String} currentUserOnlineId - user id
 */
chatMessageSchema.statics.getRecentConversation = async function (chatRoomIds, options, currentUserOnlineId) {
  try {
    return this.aggregate([
      { $match: { chatRoomId: { $in: chatRoomIds } }},
      {
        $group: {
          _id: '$chatRoomId',
          message: { $last: '$message' },
          type: { $last: '$type' },
          postedByUser: { $last: '$postedByUser' },
          createdAt: { $last: '$createdAt' },
        }
      },
      { $sort: { createdAt: -1 } },
      // do a join on another table called users, and 
      // get me a user whose _id = postedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'postedByUser',
          pipeline: [{ $project:{ username: 1}}],
          foreignField: '_id',
          as: 'postedByUser',
        }
      },
      { $unwind: "$postedByUser" },
      // do a join on another table called chatrooms, and 
      // get me room details
      // do a join on another table called users 
      
      {
        $lookup: {
          from: 'chatrooms',
          localField: '_id',
          pipeline: [{ $project: {_id: 0, createdAt: 0, updatedAt: 0}}],
          foreignField: '_id',
          as: 'roomInfo',
        },
      },  
      { $unwind: "$roomInfo" },
      { $unwind: "$roomInfo.userIds" },
      // {
      //   $lookup: {
      //     from: 'users',
      //     localField: 'roomInfo.userIds',
      //     pipeline: [{ $project: {_id: 0, createdAt: 0, updatedAt: 0}}],
      //     foreignField: '_id',
      //     as: 'roomInfo.chatwith',
      //   },
      // },
      { $skip: options.page * options.limit },
      { $limit: options.limit },

    ]);
  } catch (error) {
    throw error;
  }
}
// chatMessageSchema.statics.getRecentConversation = async function (chatRoomIds, options, currentUserOnlineId) {
//   try {
//     return this.aggregate([
//       { $match: { chatRoomId: { $in: chatRoomIds } }},
//       {
//         $group: {
//           _id: '$chatRoomId',
//           messageId: { $last: '$_id' },
//           chatRoomId: { $last: '$chatRoomId' },
//           message: { $last: '$message' },
//           type: { $last: '$type' },
//           postedByUser: { $last: '$postedByUser' },
//           createdAt: { $last: '$createdAt' },
//           readByRecipients: { $last: '$readByRecipients' },
//         }
//       },
//       { $sort: { createdAt: -1 } },
//       // do a join on another table called users, and 
//       // get me a user whose _id = postedByUser
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'postedByUser',
//           pipeline: [{ $project:{ username: 1}}],
//           foreignField: '_id',
//           as: 'postedByUser',
//         }
//       },
//       { $unwind: "$postedByUser" },
//       // do a join on another table called chatrooms, and 
//       // get me room details
//       // do a join on another table called users 
//       { $unwind: "$readByRecipients" },
//       {
//         $lookup: {
//           from: 'users',
//           localField: 'readByRecipients.readByUserId',
//           foreignField: '_id',
//           as: 'readByRecipients.readByUser',
//         }
//       },
//       {
//         $lookup: {
//           from: 'chatrooms',
//           localField: '_id',
//           pipeline: [{ $project: {createdAt: 0, updatedAt: 0}},],
//           foreignField: '_id',
//           as: 'roomInfo',
//         },
//       },
//       { $unwind: "$roomInfo" },
//       { $skip: options.page * options.limit },
//       { $limit: options.limit },

//     ]);
//   } catch (error) {
//     throw error;
//   }
// }

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
