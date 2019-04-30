'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {
	verifyAccessToken,
	verifyRefreshToken
} = require('../middleware/verifyToken');
const { isUserVerified } = require('../middleware/isUserVerified');
const bcrypt = require('bcryptjs');

const { getUserAgent } = require('../utils/getUserAgent');

router.get('/test', (req, res) => {
	const email = req.query.email;
	const userAgent = getUserAgent(req);
	console.log('useragent', userAgent);
	User.findOne(
		{
			email
		},
		{
			sessions: {
				$elemMatch: {
					ip: userAgent.ip,
					browser: userAgent.browser,
					os: userAgent.os
				}
			}
		}
	)
		.then(user => {
			res.json({ token: user.sessions[0].token });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.post('/signup', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;

	if (!name || !email || !password) {
		return res.json({ error: 'insufficient data' });
	}
	let userRefreshToken;
	let newUser = new User({ name, email, password });
	newUser
		.createSession(req)
		.then(refreshToken => {
			userRefreshToken = refreshToken;
			return newUser.generateAccessToken();
		})
		.then(userAccessToken => {
			res
				.header('x-refresh-token', userRefreshToken)
				.header('x-access-token', userAccessToken)
				.send(newUser);
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	if (!email || !password) {
		return res.json({ error: 'insufficient data' });
	}
	let userRefreshToken;
	let currentUser;
	User.findByCredentials(email, password)
		.then(user => {
			currentUser = user;
			return User.findOrCreateSession(req, email, currentUser);
		})
		.then(refreshToken => {
			userRefreshToken = refreshToken;
			return currentUser.generateAccessToken();
		})
		.then(userAccessToken => {
			res
				.header('x-refresh-token', userRefreshToken)
				.header('x-access-token', userAccessToken)
				.send(currentUser);
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

// router.get('/getaccesstoken', verifyRefreshToken, (req, res) => {
// 	const user = req.user;
// 	const accessToken = jwt.sign({ email: user.email }, process.env.tokenSecret, {
// 		expiresIn: process.env.tokenLife
// 	});
// 	res.header('access-token', accessToken).send({ user: user });
// });

// // to be done
// router.post('/deletetoken', verifyAccessToken, (req, res) => {
// 	let ip = req.ip;
// 	let user = req.user;
// 	User.findOne({ email: user.email })
// 		.then(user => {
// 			let flag = false;
// 			let refreshTokenArray = [];
// 			for (let i = 0; i < user.refreshToken.length; i++) {
// 				if (ip != user.refreshToken[i].ip) {
// 					refreshTokenArray.push(user.refreshToken[i]);
// 				} else {
// 					flag = true;
// 				}
// 			}
// 			if (flag) {
// 				user.refreshToken = refreshTokenArray;
// 				saveUser(user, res, null, null, 'Token Deleted Successfully');
// 			}
// 		})
// 		.catch(error => {
// 			res.json({ error: error.message });
// 		});
// });

// router.get('/gettokens', verifyAccessToken, (req, res) => {
// 	let user = req.user;
// 	User.findOne({ email: user.email })
// 		.then(user => {
// 			res.json({ refreshToken: user.refreshToken });
// 		})
// 		.catch(error => {
// 			res.json({ error: error.message });
// 		});
// });

module.exports = router;
