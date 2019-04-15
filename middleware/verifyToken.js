'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const verifyToken = (req, res, next) => {
	const accessToken = req.header('access-token');
	const refreshToken = req.header('refresh-token');
	let secret = null;
	let token = null;

	if (accessToken) {
		secret = process.env.tokenSecret;
		token = accessToken;
	} else {
		secret = process.env.refreshTokenSecret;
		token = refreshToken;
	}

	jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			return res.json({ error: 'invalid token' });
		}
		User.findOne({ email: decoded.email })
			.then(user => {
				if (!user) {
					return res.json({ error: 'user not found' });
				}
				req.user = user;
				next();
			})
			.catch(error => {
				return res.json({ error: error.message });
			});
	});
};

module.exports = verifyToken;
