const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/all', userController.getAllUser);
router.get('/:userid/friends', userController.getUserFriend);

router.get('/suggest', userController.getSuggestFriend);
router.post('/updatefriend', userController.postUpdateFriend);
router.get('/friend/myrequest', userController.getMyRequest);
router.get('/friend/request', userController.getFriendRequest);


router.post('/updateuser', userController.postUpdateUser);
router.post('/resetpass', userController.postResetPass);


router.get('/:userid', userController.getUser);


module.exports = router;
