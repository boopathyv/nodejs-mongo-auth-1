'use strict';

require('./settings');
const db = require('./database/connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const app = express();
const userController = require('./controller/user');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Expose-Headers','access-token,refresh-token');
    next();
}

app.use(allowCrossDomain);

app.use('/user/', userController);

app.listen(3000, () => console.log('server is running'));
