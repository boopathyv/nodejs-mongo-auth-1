'use strict';

require('./settings');
const db = require('./database/connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const userController = require('./controller/user');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors());

app.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Methods',
		'GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE'
	);
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id'
	);

	res.header(
		'Access-Control-Expose-Headers',
		'x-access-token, x-refresh-token'
	);

	next();
});

app.use('/user/', userController);

app.listen(3000, () => console.log('server is running'));
