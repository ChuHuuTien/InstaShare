const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const friendRequestSchema = new Schema({
    sender: { type: mongoose.Types.ObjectId, required: true, ref: 'user'},
    receiver: { type: mongoose.Types.ObjectId, required: true, ref: 'user'},
},{
    timestamps: true,
    collection: "friendrequest",
    versionKey: false,
});

friendRequestSchema.statics.createFriendRequest = async function (friendrequest) {
  try {
      friendrequest = new this(friendrequest);
    	await friendrequest.save()
      return friendrequest;
      
  } catch (error) {
    throw error;
  }
}

friendRequestSchema.statics.findFriendRequest = async function (sender , receiver) {
  try {
      const request = await this.findOne({sender: sender, receiver: receiver})
      return request;
  } catch (error) {
    throw error;
  }
}

friendRequestSchema.statics.getMyRequest = async function (useid) {
  try {
    const requests = await this.find({sender: useid}, {receiver: 1});
    return requests;
  } catch (error) {
    throw error;
  }
}

friendRequestSchema.statics.getAllFriendReqById = async function (useid) {
    try {
      const requests = await this.find({receiver: useid}, {sender: 1});
      return requests;
    } catch (error) {
      throw error;
    }
}

friendRequestSchema.statics.deleteFriendRequest = async function (sender , receiver) {
  try {
    await this.deleteOne({sender: sender, receiver: receiver});
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = mongoose.model('FriendRequest', friendRequestSchema);
