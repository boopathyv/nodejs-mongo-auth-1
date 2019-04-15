const mongoose = require('mongoose');

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
		type: [String]
	}
});

const User = mongoose.model('users', userSchema);

module.exports = User;
