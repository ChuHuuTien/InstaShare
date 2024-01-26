
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { options } = require('../routes/post');

class postController{

  // [GET] /post/:postid
  async getPost(req, res, next) {
    const postid = req.params.postid;
    try{
      const post = await Post.getPostById(postid);
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const comments = await Comment.getCommentsByPostId(postid, options);
      res.status(200).json({message: "Success", post: post, comments: comments});

    }catch(err){
      res.status(400).json({err: err});
    }
  }

  // [GET] /post/all
  async getPostsByUser(req, res, next) {
    const userid = req.params.userid;
    try{
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const posts = await Post.getPostsByCreatorId(userid, options);
      res.status(200).json({message: "Success", posts: posts});
    }catch(err){
      res.status(400).json({err: err});
    }
  }

  // [POST] /post/create
  async createPost(req, res, next) {
    try{
      const {content} = req.body;
      const fileStrs = req.body.images;
      const newPost = {
        creatorId: req.user.userid,
        content: content,
        imageSrcs: [],
      }
      if(fileStrs){
        const imgUrl = new Array();
        for(let i = 0; i < fileStrs.length; i++){
          const uploadedResponse = await cloudinary.uploader.upload(fileStrs[i], {
            upload_preset: 'image_news',
            folder: 'news'
          })
          imgUrl.push(uploadedResponse.secure_url);
        }
        newPost.imageSrcs = imgUrl;
      }
      const createPost = await Post.createPost(newPost);
      const post = await Post.getPostById(createPost._id);
      if (!createPost) {
        return res .status(400).josn({message: "Có lỗi trong quá trình tạo bài viết, vui lòng thử lại."});
      }
      return res.status(201).json({post: post});
    }catch(error){
      console.log(error)
      res.status(409).json({error: error});
    }
  }

  // [POST] /post/like
  async postLike(req, res, next) {
    try{
      const postid = req.body.postid;
      const currentLoggedUser = req.user.userid;
      const status = await Post.likePost(postid, currentLoggedUser);
      const post = await Post.getPostById(postid);
      if(post){
        return res.status(201).json({status, post});
      }else{
        return res.status(400).json({error: "error when like post"});
      }
    }catch(error){
      res.status(409).json({error});
    }
  }
  // [POST] /post/update
  async postUpdate(req, res, next) {
    try{
      const postid = req.body.postid;
      const body = req.body;
      const post = await Post.updatePost(postid, body);
      if(post){ 
        res.status(200).json({message: "Update post success", post: post});
      } else res.status(400).json({message: "Update post fail"});
    }catch(error){
      res.status(409).json({error});
    }
  }
  // [POST] /post/:postid/comment
  async postComment(req, res, next) {
    try{
      const postid = req.params.postid;
      const currentLoggedUser = req.user.userid;
      const comment = req.body.comment;
      const newComment = {
        postId: postid,
        content: comment,
        creatorId: currentLoggedUser,
      }
      const createComment = await Comment.createCommentInPost(newComment);
      await Post.plusComment(postid, 1);

      if (!createComment) {
        return res .status(400).josn({message:"Có lỗi trong quá trình tạo bình luận, vui lòng thử lại."});
      }
      return res.status(201).json({comment: createComment});
    }catch(error){
      console.log(error)
      res.status(409).json({error: error});
    }
  }
// [GET] /post/:postid/comment
async getCommentsByPost(req, res, next) {
  try{
    const postid = req.params.postid;
    const options = {
      page: parseInt(req.query.page) || 0,
      limit: parseInt(req.query.limit) || 100,
    };

    const Comments = await Comment.getCommentsByPostId(postid, options);
    return res.status(201).json({comments: Comments});
  }catch(error){
    res.status(409).json({error: error});
  }
}

  // [GET] /post/getNews
  async getNews(req, res, next) {
    try{
      const userid = req.user.userid;
      const result = await User.getFriendById(userid);
      const friendids = new Array();
      result.friends.map((friend)=>{
        friendids.push(friend._id);
      })
      friendids.push(new mongoose.Types.ObjectId(userid));
      const options = {
        page: parseInt(req.query.page) || 0,
        limit: parseInt(req.query.limit) || 10,
      };
      const news = await Post.getPostByFriendIds(friendids, options);
      return res.status(201).json({news});
    }catch(error){
      console.log(error);
      res.status(409).json({error: error});
    }
  }

  // [DELETE] /post/:postid
  async deletePost(req, res, next) {
    try{
      const postid = req.params.postid;
      const post = await Post.getPostById(postid);
      const imageSrcs = post.imageSrcs;
      const regex= /upload\/(?:v\d+\/)?([^\.]+)/
      imageSrcs.map((img)=>{
        const match = regex.exec(img);
        const public_id = match[1];
        cloudinary.uploader.destroy(public_id);
      })
      await Comment.deleteAllCommentByPost(postid); 
      const response = await Post.deletePostById(postid);
      if(response) return res.status(200).json({message: "Delete post success!"});
    }catch(error){
      res.status(409).json({error: error});
    }
  }

  // [DELETE] /post/:commentid/comments
  async deleteComment(req, res, next) {
    try{
      const commentid = req.params.commentid;
      const comment = await Comment.findOne({_id: commentid});
      const response = await Comment.deleteComment(commentid); 
      await Post.plusComment(comment.postId, -1);
      if(response) return res.status(200).json({message: "Delete comment success!"});
    }catch(error){
      res.status(409).json({error: error});
    }
  }
}

module.exports = new postController();
