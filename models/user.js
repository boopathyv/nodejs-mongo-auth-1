'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true,
		unique: true
	},
	password: {
		type: String,
		required: true,
		select: false
	},
	refreshToken: {
		type: [String],
		select: false
	}
});

userSchema.methods.toJSON = function() {
	let user = this;
	let userObject = user.toObject();
	delete userObject.password;
	delete userObject.refreshToken;
	return userObject;
};

userSchema.pre('save', function() {
	const user = this;
	if (user.isModified('password')) {
		const salt = bcrypt.genSaltSync(10);
		const hashedPwd = bcrypt.hashSync(user.password, salt);
		user.password = hashedPwd;
	}
});

const User = mongoose.model('users', userSchema);

module.exports = User;