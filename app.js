
var express = require('express');
var stormpath = require('express-stormpath');

var app = express();

app.set('views', './views');
app.set('view engine', 'jade');

var stormpathMiddleware = stormpath.init(app, {
	apiKeyFile: 'apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties',
	application: 'https://api.stormpath.com/v1/applications/1y3g1dqAhqk9qI2vKRIeBE',
	secretKey: 'some_long_random_string',
	expandCustomData: true,
	enableForgotPassword: true
});

app.use(stormpathMiddleware);

app.get('/', function(req, res) {
	res.render('home', {
		title: 'Welcome'
	});
});

app.use('/profile',require('./profile')());

app.listen(3000);