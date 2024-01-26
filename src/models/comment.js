const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    postId: { type: mongoose.Types.ObjectId, required: true, ref: 'post'},
    creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'user'},
    content: { type: String, required: true},
    // likes: { type: Map, of: Boolean },
  }, { 
    timestamps: true,
    collection: "comments",
    versionKey: false,
  }
);

/**
 * @param {String} postid - id of post
 * @return {Object} post
 */
commentSchema.statics.getCommentsByPostId = async function (postid, options) {
  try {
    const aggregate = await this.aggregate([
      { $match: { postId: new mongoose.Types.ObjectId(postid)}},
      // { $sort: { createdAt: -1 } },
      {
        $lookup: {
            from: 'users',
            localField: 'creatorId',
            pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL: 1}}],
            foreignField: '_id',
            as: 'commentByUser',
          }
      },
      { $unwind: "$commentByUser" },
      { $skip: options.page * options.limit },
      { $limit: options.limit },
      { $project: { updatedAt: 0, } }
    ])
    return aggregate;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} postid - id of post
 * @param {String} comment - comment
 * @param {String} currentLoggedUser - id of user
 * @return {Object} post
 */
commentSchema.statics.createCommentInPost = async function (newComment) {
  try {
    newComment = new this(newComment);
    await newComment.save();
    // return newComment;
    const comment = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(newComment._id)}},
      {
        $lookup: {
            from: 'users',
            localField: 'creatorId',
            pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL: 1}}],
            foreignField: '_id',
            as: 'commentByUser',
          }
      },
      { $unwind: "$commentByUser" },
      { $project:{ updatedAt: 0}}
      ])
      return comment[0];
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} commentId
 * @returns {Object} boolen
*/

commentSchema.statics.deleteComment = async function (commentId) {
  try {
    await this.deleteOne({_id: commentId});
    return true;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} postId
 * @returns {Object} boolen
*/

commentSchema.statics.deleteAllCommentByPost = async function (postId) {
  try {
    await this.deleteMany( { postId : postId } );
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = mongoose.model('Comment', commentSchema);

