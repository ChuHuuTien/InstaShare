const jwtVariable = require('../variables/jwt');

const User = require('../models/user');

const authMethod = require('../methods/auth');

exports.isAuth = async (req, res, next) => {
	// Lấy access token từ header
	const accessTokenFromHeader = req.headers['authorization'];
	if (!accessTokenFromHeader) {
		return res.status(401).json({message:'Không tìm thấy access token!'});
	}

	const accessTokenSecret =
		process.env.ACCESS_TOKEN_SECRET || jwtVariable.accessTokenSecret;

	const verified = await authMethod.verifyToken(
		accessTokenFromHeader,
		accessTokenSecret,
	);
	if (!verified) {
		return res.status(401).json({message:'Bạn không có quyền truy cập vào tính năng này!'});
	}
	
	// email, userid
	req.user = verified.payload; 

	return next();
};
