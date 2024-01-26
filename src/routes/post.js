const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');

router.post('/:postid/comment', postController.postComment);
router.post('/create', postController.createPost);
router.post('/like', postController.postLike);
router.post('/update',postController.postUpdate)

router.get('/news', postController.getNews);
router.get('/all/:userid', postController.getPostsByUser);
router.get('/:postid', postController.getPost);
router.get('/:postid/comments', postController.getCommentsByPost);

router.delete('/:postid', postController.deletePost);
router.delete('/:commentid/comment', postController.deleteComment);



module.exports = router;
