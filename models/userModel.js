'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getUserAgent } = require('../utils/getUserAgent');
const jwt = require('jsonwebtoken');

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		trim: true
	},
	password: {
		type: String,
		minlenght: 8,
		required: true
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	sessions: [
		{
			ip: { type: String },
			token: { type: String },
			browser: { type: String },
			os: { type: String },
			date: { type: Date }
			//location to be added
		}
	]
});

/* middlewares */
userSchema.pre('save', function() {
	const user = this;
	if (user.isModified('password')) {
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(user.password, salt);
		user.password = hashedPwd;
	}
});

/* Schema methods */
userSchema.methods.toJSON = function() {
	let user = this;
	let userObject = user.toObject();
	delete userObject.password;
	delete userObject.sessions;
	return userObject;
};

userSchema.methods.createSession = function(req) {
	let user = this;
	const userAgent = getUserAgent(req);
	const session = {};
	session.ip = req.ip;
	session.token = user.generateRefreshToken();
	session.browser = userAgent.browser;
	session.os = userAgent.os;
	session.date = userAgent.date;
	return saveSession(user, session)
		.then(refreshToken => {
			return refreshToken;
		})
		.catch(error => {
			return Promise.reject(new Error('Cannot save session to db ' + error));
		});
};

userSchema.methods.generateRefreshToken = function() {
	let user = this;
	let refreshToken = jwt.sign(
		{ _id: user._id },
		process.env.refreshTokenSecret
	);
	return refreshToken;
};

userSchema.methods.generateAccessToken = function() {
	let user = this;
	let accessToken = jwt.sign({ _id: user._id }, process.env.accessTokenSecret, {
		expiresIn: process.env.tokenLife
	});
	return accessToken;
};

/* helper methods */
const saveSession = (user, session) => {
	return new Promise((resolve, reject) => {
		user.sessions.push({
			ip: session.ip,
			token: session.token,
			browser: session.browser,
			os: session.os,
			data: session.date
		});
		user
			.save()
			.then(() => {
				return resolve(session.token);
			})
			.catch(error => {
				reject(new Error(error));
			});
	});
};

userSchema.methods.checkPassword = function() {};

const User = mongoose.model('users', userSchema);

module.exports = User;
