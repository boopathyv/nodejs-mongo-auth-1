const jwt = require('jsonwebtoken');

const getRefreshToken = id => {
	return jwt.sign({ _id: id }, process.env.refreshTokenSecret);
};

const getAccessToken = id => {
	return jwt.sign({ _id: id }, process.env.accessTokenSecret, {
		expiresIn: process.env.tokenLife
	});
};

module.exports = {
	getAccessToken,
	getRefreshToken
};
