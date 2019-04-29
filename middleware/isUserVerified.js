'use strict';

const User = require('../models/userModel');

const isUserVerified = (req, res, next) => {
	const user_id = req.user_id;
	User.findOne({ _id: user_id }).then(user => {
		if (user.isVerified === true) {
			next();
		} else {
			return res.json({ error: 'Kindly verify your account' });
		}
	});
};

module.exports = {
	isUserVerified
};
