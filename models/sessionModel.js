'use strict';
const mongoose = require('mongoose');

const sessionSchema = mongoose.Schema({
	ip: { type: String },
	token: { type: String },
	browser: { type: String },
	os: { type: String },
	date: { type: Date }
	//location to be added
});

sessionSchema.methods.toJSON = function() {
	let session = this;
	let sessionObject = session.toObject();
	delete sessionObject.token;
	return sessionObject;
};

module.exports = sessionSchema;
