'use strict';
const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const verifyToken = require('../middleware/verifyToken');

router.post('/signup', (req, res) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const ip = req.ip;
	if (!name || !email || !password) {
		res.json({ error: 'insufficient data' });
	}
	const accessToken = jwt.sign({ email: email }, process.env.tokenSecret, {
		expiresIn: process.env.tokenLife
	});
	let refreshToken = {};
	refreshToken.ip = ip;
	refreshToken.token = jwt.sign(
		{ email: email },
		process.env.refreshTokenSecret
	);
	const user = new User({ name: name, email: email, password: password });
	user.refreshToken.push(refreshToken);
	user
		.save()
		.then(user => {
			res.header('access-token', accessToken);
			res.header('refresh-token', refreshToken).send({ user: user });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.post('/login', (req, res) => {
	const email = req.body.email;
	const password = req.body.password;
	const ip = req.ip;
	if (!email || !password) {
		res.json({ error: 'insufficient data' });
	}
	const accessToken = jwt.sign({ email: email }, process.env.tokenSecret, {
		expiresIn: process.env.tokenLife
	});

	User.findOne({ email: email })
		.then(user => {
			if (!user) {
				res.json({ error: 'User does not exist' });
			}
			let refreshToken = null;
			for (let i = 0; i < user.refreshToken.length; i++) {
				if (ip == user.refreshToken[i].ip) {
					refreshToken = user.refreshToken[i].token;
					break;
				}
			}
			if (!refreshToken) {
				refreshToken = jwt.sign(
					{ email: email },
					process.env.refreshTokenSecret
				);
			}
			res.header('refresh-token', refreshToken);
			res.header('access-token', accessToken).send({ user: user });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.get('/getaccesstoken', verifyToken, (req, res) => {
	const user = req.user;
	const accessToken = jwt.sign({ email: user.email }, process.env.tokenSecret, {
		expiresIn: process.env.tokenLife
	});
	res.header('access-token', accessToken).send({ user: user });
});

// to be done
router.post('/deletetoken', verifyToken, (req, res) => {
	let ip = req.body.ip;
	let user = req.user;
	User.findOne({ email: user.email })
		.then(user => {
			for (let i = 0; i < user.refreshToken.length; i++) {
				if (ip == user.refreshToken[i].ip) {
					user.refreshToken[i].token = null;
				}
			}
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.get('/gettokens', verifyToken, (req, res) => {
	let user = req.user;
	User.findOne({ email: user.email })
		.then(user => {
			res.json({ refreshToken: user.refreshToken });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

module.exports = router;
