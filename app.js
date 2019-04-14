'use strict';

require('./settings');
const db = require('./database/connection');
const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const router = express.Router;
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
	res.json({ working: 'yes' });
});

app.listen(3000, () => console.log('server is running'));
