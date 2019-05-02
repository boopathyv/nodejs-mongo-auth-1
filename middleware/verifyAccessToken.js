'use strict';
const jwt = require('jsonwebtoken');

const verifyAccessToken = (req, res, next) => {
	const token = req.header('x-access-token');
	const secret = process.env.accessTokenSecret;
	jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			return res.json({ error: 'invalid token' });
		} else {
			req.user_id = decoded._id;
			next();
		}
	});
};

module.exports = {
	verifyAccessToken
};
