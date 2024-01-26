const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    creatorId: { type: mongoose.Types.ObjectId, required: true, ref: 'user'},
    content: { type: String, required: true},
    imageSrcs: [
      { _id: false, type: String, default: ""}
    ],
    likes: [{ _id: false, type: Schema.Types.ObjectId, ref: 'user' }],
    commentLength: { type: Number, default: 0}
  },
  { 
    timestamps: true ,
    collection: "posts",
    versionKey: false,
  }
);

/**
 * @param {String} postid - id of post
 * @return {Object} post
 */
postSchema.statics.getPostById = async function (postid) {
  try {
    // const post = await this.findOne({ _id: postid });
    // return post;
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postid)}},
      {
        $lookup: {
            from: 'users',
            localField: 'creatorId',
            pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL: 1}}],
            foreignField: '_id',
            as: 'postedByUser',
          }
      },
      { $unwind: "$postedByUser" },
      { 
        $lookup: {
          from: "users",
          localField: 'likes',
          pipeline: [{ $project:{ firstName: 1, lastName: 1}}],
          foreignField: '_id',
          as: "likesByUsers"
        }
        
      },
      { $project: { likes: 0, updatedAt: 0, } }
      ])
      return aggregate[0];
  } catch (error) {
    throw error;
  }
}


/**
 * @param {Object} post
 * @returns {Object} new post object created
 */
postSchema.statics.likePost = async function (postid, userid) {
  try {
    const result = await this.find({_id: postid, likes: {$all: userid}});
    if(!result.length) {
      await this.updateOne({_id: postid}, { $push: {likes: userid} })
		  return {message: "Like post success"};
    }else {
      await this.updateOne({_id: postid}, { $pull: {likes: userid} })
      return {message: "Unlike post success"};
    }
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} post
 * @returns {Object} new length of comment this post
 */
postSchema.statics.plusComment = async function (postid, number) {
  try {
       await this.updateOne({_id: postid},{ $inc: { commentLength: number } } )
		  return {message: "Plus comment success"};
    
  } catch (error) {
    throw error;
  }
}
/**
 * @param {String} postid - id of user
 * @return {Object} user who have this postid
 */
postSchema.statics.updatePost = async function (postid, change) {
  try {
    await this.updateOne({ _id: postid } , change);
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postid)}},
      {
        $lookup: {
            from: 'users',
            localField: 'creatorId',
            pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL: 1}}],
            foreignField: '_id',
            as: 'postedByUser',
          }
      },
      { $unwind: "$postedByUser" },
      { 
        $lookup: {
          from: "users",
          localField: 'likes',
          pipeline: [{ $project:{ firstName: 1, lastName: 1}}],
          foreignField: '_id',
          as: "likesByUsers"
        }
        
      },
      { $project: { likes: 0, updatedAt: 0, } }
      ])
      return aggregate[0];
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} post
 * @returns {Object} new post object created
 */
postSchema.statics.createPost = async function (post) {
  try {
    post = new this(post);
    await post.save()
    return post;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} postid - id of post
 * @return {Object} post
 */
postSchema.statics.getPostsByCreatorId = async function (userid, options) {
  try {
    const aggregate = await this.aggregate([
      { $match: { creatorId: new mongoose.Types.ObjectId(userid)}},
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
            from: 'users',
            localField: 'creatorId',
            pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL: 1}}],
            foreignField: '_id',
            as: 'postedByUser',
          }
        },
        { $unwind: "$postedByUser" },
        { 
          $lookup: {
            from: "users",
            localField: 'likes',
            pipeline: [{ $project:{ firstName: 1, lastName: 1}}],
            foreignField: '_id',
            as: "likesByUsers"
          }
        },
        { $skip: options.page * options.limit },
        { $limit: options.limit },
        { $project: { likes: 0, updatedAt: 0, } }
      ])
      return aggregate;
  } catch (error) {
    throw error;
  }
}
/**
 * @param {Object} post
 * @returns {Object} new post object created
*/
postSchema.statics.getPostByFriendIds = async function (friendids, options) {
  try {
    const aggregate = await this.aggregate([
      { $match: { creatorId: { $in: friendids } }},
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
            from: 'users',
            localField: 'creatorId',
            pipeline: [{ $project:{ firstName: 1, lastName: 1, avatarURL: 1}}],
            foreignField: '_id',
            as: 'postedByUser',
          }
        },
        { $unwind: "$postedByUser" },
        { 
          $lookup: {
            from: "users",
            localField: 'likes',
            pipeline: [{ $project:{ firstName: 1, lastName: 1}}],
            foreignField: '_id',
            as: "likesByUsers"
          }
        },
        { $skip: options.page * options.limit },
        { $limit: options.limit },
        { $project: { likes: 0, updatedAt: 0, } }

      ])
      return aggregate;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} post
 * @returns {Object} new post object created
*/
postSchema.statics.deletePostById = async function (postid) {
  try {
    await this.deleteOne({_id: postid});
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = mongoose.model('Post', postSchema);
