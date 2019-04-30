const jwt = require('jsonwebtoken');

const getRefreshToken = id => {
	return jwt.sign({ _id: id }, process.env.refreshTokenSecret);
};

const getAccessToken = id => {
	return jwt.sign({ _id: id }, process.env.refreshTokenSecret);
};

module.exports = {
	getAccessToken,
	getRefreshToken
};
