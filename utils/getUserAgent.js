const parser = require('ua-parser-js');

const getUserAgent = req => {
	const ua = parser(req.headers['user-agent']);
	const userAgent = {};
	userAgent.browser = ua.browser.name;
	userAgent.os = ua.os.name + ' ' + ua.os.version;
	userAgent.date = new Date();
	return userAgent;
};

module.exports = {
	getUserAgent
};
