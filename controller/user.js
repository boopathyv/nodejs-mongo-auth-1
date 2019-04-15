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
	if (!name || !email || !password) {
		res.json({ error: 'insufficient data' });
	}
	const accessToken = jwt.sign({ email: email }, process.env.tokenSecret, {
		expiresIn: process.env.tokenLife
	});
	const refreshToken = jwt.sign(
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
	if (!email || !password) {
		res.json({ error: 'insufficient data' });
	}
	const accessToken = jwt.sign({ email: email }, process.env.tokenSecret, {
		expiresIn: process.env.tokenLife
	});
	const refreshToken = jwt.sign(
		{ email: email },
		process.env.refreshTokenSecret
	);
	User.find({ email: email })
		.then(user => {
			if (!user) {
				res.json({ error: 'User does not exist' });
			}
			res.header('access-token', accessToken);
			res.header('refresh-token', refreshToken).send({ user: user });
		})
		.catch(error => {
			res.json({ error: error.message });
		});
});

router.get('/gettoken', verifyToken, (req, res) => {
	const accessToken = jwt.sign(
		{ email: req.user.email },
		process.env.tokenSecret,
		{
			expiresIn: process.env.tokenLife
		}
	);
	res.header('access-token', accessToken).send({ user: req.user });
});

router.get('/getuser', verifyToken, (req, res) => {
	res.json({ user: req.user });
});

module.exports = router;
