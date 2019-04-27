'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (token, secret, req, res, next) => {
	jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			return res.json({ error: 'invalid token' });
		} else {
			req.user_id = decoded._id;
			next();
		}
	});
};

const verifyAccessToken = (req, res, next) => {
	const token = req.header('x-access-token');
	const secret = process.env.accessTokenSecret;
	verifyToken(token, secret, req, res, next);
};

const verifyRefreshToken = (req, res, next) => {
	const token = req.header('x-refresh-token');
	const secret = process.env.refreshTokenSecret;
	verifyToken(token, secret, req, res, next);
};

module.exports = {
	verifyAccessToken,
	verifyRefreshToken
};
