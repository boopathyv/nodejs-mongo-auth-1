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

router.get('/test', (req, res) => {
	const userAgent = getUserAgent(req);
	console.log(userAgent);
	res.json({ user: 'ok' });
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

// router.post('/login', (req, res) => {
// 	const email = req.body.email;
// 	const password = req.body.password;
// 	const ip = req.ip;
// 	if (!email || !password) {
// 		return res.json({ error: 'insufficient data' });
// 	}
// 	const accessToken = jwt.sign({ email: email }, process.env.tokenSecret, {
// 		expiresIn: process.env.tokenLife
// 	});

// 	User.findOne({ email: email })
// 		.then(user => {
// 			if (!user) {
// 				return res.json({ error: 'User does not exist' });
// 			}
// 			if (!bcrypt.compareSync(password, user.password)) {
// 				return res.json({ error: 'User does not exist' });
// 			}
// 			let refreshToken = null;
// 			for (let i = 0; i < user.refreshToken.length; i++) {
// 				if (ip == user.refreshToken[i].ip) {
// 					refreshToken = user.refreshToken[i].token;
// 					break;
// 				}
// 			}
// 			if (!refreshToken) {
// 				refreshToken = jwt.sign(
// 					{ email: email },
// 					process.env.refreshTokenSecret
// 				);

// 				let newRefreshToken = {};
// 				newRefreshToken.ip = ip;
// 				newRefreshToken.token = refreshToken;
// 				user.refreshToken.push(newRefreshToken);
// 				saveUser(user, res, accessToken, refreshToken);
// 			} else {
// 				res.header('refresh-token', refreshToken);
// 				return res.header('access-token', accessToken).send({ user: user });
// 			}
// 		})
// 	.catch(error => {
// 		return res.json({ error: error.message });
// 	});
// });

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
