'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { getUserAgent } = require('../utils/getUserAgent');
const { getAccessToken, getRefreshToken } = require('../utils/getToken');
const sessionSchema = require('./sessionModel');

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
		minlength: 8,
		required: true
	},
	isVerified: {
		type: Boolean,
		default: true
		//change default to false, once mail functionality is included
	},
	sessions: [sessionSchema]
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

userSchema.statics.findOrCreateSession = function(req, email, userDoc) {
	let User = this;
	const userAgent = getUserAgent(req);
	return User.findOne(
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
			if (user !== null) {
				if (user.sessions.length !== 0) {
					return user.sessions[0].token;
				} else {
					return userDoc.createSession(req);
				}
			} else {
				return Promise.reject(new Error('User not found'));
			}
		})
		.catch(error => {
			return Promise.reject(new Error(error));
		});
};

userSchema.methods.createSession = function(req) {
	let user = this;
	const userAgent = getUserAgent(req);
	const session = {};
	session.ip = userAgent.ip;
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
	return getRefreshToken(user._id);
};

userSchema.methods.generateAccessToken = function() {
	let user = this;
	return getAccessToken(user._id);
};

/* Static methods */
userSchema.statics.findByCredentials = function(email, password) {
	let User = this;
	return User.findOne({ email }).then(user => {
		if (!user) return Promise.reject(new Error('user not found'));

		return new Promise((resolve, reject) => {
			bcrypt.compare(password, user.password, (err, res) => {
				if (res) {
					resolve(user);
				} else {
					reject(new Error('password does not match'));
				}
			});
		});
	});
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

const User = mongoose.model('users', userSchema);

module.exports = User;
