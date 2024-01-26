const express = require('express');
const cors = require('./config/corsConfig');
const helmet = require('helmet');
const http = require('http');
const routes = require('./routes');
const db = require('./config/db');
const WebSockets = require('./app/socket');
const handleErr = require('./middlewares/handleErr');
const logger = require('morgan');
const cookieSession = require("cookie-session");

require('dotenv').config();

const port = process.env.PORT;

const app = express();
app.use(logger('dev'));
db.connect();

app.use(
	cookieSession({
		name: "session",
		keys: ["chuhuutien"],
		maxAge: 24 * 60 * 60 * 100,
	})
);

app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(cors);

app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));


routes(app);

app.use((req, res, next) => {
  return res.status(404).json({
    success: false,
    message: 'API endpoint doesn\'t exist',
  })
});
app.use(handleErr);

const server = http.createServer(app);

server.listen(port, function () {
  console.log('Server listening at port ' + port);
});

const socket = require('socket.io')(server,{
  cors: {
    origin: '*',
    credentials: true,
  }
});
global.io = socket.listen(server);
global.usersOnline = [];
global.io.on('connection', WebSockets);
