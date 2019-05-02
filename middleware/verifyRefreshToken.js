'use strict';
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const verifyRefreshToken = (req, res, next) => {
	const token = req.header('x-refresh-token');
	const secret = process.env.refreshTokenSecret;
	jwt.verify(token, secret, (err, decoded) => {
		if (err) {
			return res.json({ error: 'invalid token' });
		} else {
			req.user_id = decoded._id;
			User.findOne(
				{
					_id: decoded._id
				},
				{
					sessions: {
						$elemMatch: {
							token
						}
					}
				}
			)
				.then(user => {
					if (user !== null && user.sessions.length !== 0) {
						next();
					} else {
						return res.json({ error: 'Session does not exist' });
					}
				})
				.catch(error => {
					return res.json({ error: error.message });
				});
		}
	});
};

module.exports = {
	verifyRefreshToken
};
