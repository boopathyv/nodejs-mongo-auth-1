'use strict';
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
	const token = req.header('access-token');
};

module.exports = verifyToken;
