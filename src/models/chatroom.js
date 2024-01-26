const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatRoomSchema = new Schema({
  userIds: [{
    _id: false,
    type: Schema.Types.ObjectId,
  }],
  type: {type:String, default: "private"},
  chatInitiator: {type: Schema.Types.ObjectId, ref:'users'},
  groupName: {type:String, require:false, default:""},
},{
  timestamps: true,
  collection: "chatrooms",
  versionKey: false,
});


/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getChatRoomsByUserId = async function (userId) {
  try {
    const rooms = await this.find({ userIds: { $all: [new mongoose.Types.ObjectId(userId)] } });
    return rooms;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} userId - id of user
 * @return {Array} array of all chatroom that the user belongs to
 */
chatRoomSchema.statics.getRecentConversation = async function (userId) {
  try {
    return this.aggregate([
      {$match :{ userIds: { $all: [new mongoose.Types.ObjectId(userId) ] } }},
      {
        $lookup: {
          from: 'users',
          localField: 'userIds',
          foreignField: '_id',
          pipeline: [
            { $match: {_id: {$ne: new mongoose.Types.ObjectId(userId)} }},
            { $project: { firstName: 1, lastName: 1, avatarURL:1}}
          ],
          as: 'users',
        }
      },
      {$project:{ createdAt: 0, updatedAt:0, userIds: 0}}

    ]);
  } catch (error) {
    console.log(error)
    throw error;
  }
  
}

/**
 * @param {String} roomId - id of chatroom
 * @return {Object} chatroom
 */
chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  try {
    const room = await this.findOne({ _id: roomId });
    return room;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Array} userIds - array of strings of userIds
 * @param {String} chatInitiator - user who initiated the chat
 * @param {CHAT_ROOM_TYPES} type
 */
chatRoomSchema.statics.initiateChat = async function (userIds, chatInitiator) {
  try {
    const availableRoom = await this.findOne({
      userIds: {
        $size: userIds.length,
        $all: [...userIds],
      },
    });
    if (availableRoom) {
      return {
        isNew: false,
        message: 'retrieving an old chat room',
        chatRoomId: availableRoom._doc._id,
        type: availableRoom._doc.type,
      };
    }
    const newRoom = await this.create({ userIds: userIds, chatInitiator: chatInitiator });
    return {
      isNew: true,
      message: 'creating a new chatroom',
      chatRoomId: newRoom._doc._id,
      type: newRoom._doc.type,
    };
  } catch (error) {
    console.log('error on start chat method', error);
  }
}

module.exports = mongoose.model('Chatroom', chatRoomSchema);

