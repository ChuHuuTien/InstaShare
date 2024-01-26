const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');
// const authMiddleware = require('../middlewares/isAuth');
// const isAuth = authMiddleware.isAuth;

router.post('/email', authController.postEmail);
router.post('/verifyotp', authController.postVerifyOtp);
router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);

router.post('/forgot', authController.postForgot);
router.post('/reset',authController.postReset);
router.post('/refresh',authController.refreshToken);

router.post("/google", authController.google);



module.exports = router;
