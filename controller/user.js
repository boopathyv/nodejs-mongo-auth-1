'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const {
	verifyAccessToken,
	verifyRefreshToken
} = require('../middleware/verifyToken');
const { getAccessToken, getRefreshToken } = require('../utils/getToken');
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

router.get(
	'/getaccesstoken',
	verifyRefreshToken,
	isUserVerified,
	(req, res) => {
		const id = req.user_id;
		const accessToken = getAccessToken(id);
		res.header('x-access-token', accessToken).send({ user_id: id });
	}
);

router.post('/deletetoken', verifyAccessToken, isUserVerified, (req, res) => {
	const sessionDocId = req.body.sessionid;
	const user = req.user;
	const etho = user.sessions.id(sessionDocId).remove();
	user
		.save()
		.then(user => {
			res.json({ user: user });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.get('/gettokens', verifyAccessToken, isUserVerified, (req, res) => {
	const id = req.user_id;
	User.findOne({ _id: id })
		.then(user => {
			// returns all information for now, but should exclude tokens
			res.json({ sessions: user.sessions });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

module.exports = router;
