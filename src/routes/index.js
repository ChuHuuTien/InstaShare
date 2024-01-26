const auth = require('./auth');
const user = require('./user');
const post = require('./post');
const roomRouter = require('./chatRoom');

const authMiddleware = require('../middlewares/isAuth');
const isAuth = authMiddleware.isAuth;

const route = (app, io) => {

    app.use('/auth', auth);
    app.use('/user',isAuth, user);
    app.use('/post', isAuth, post);
    app.use('/room', isAuth, roomRouter);

};

module.exports = route;
