
var express = require('express');
var stormpath = require('express-stormpath');
var mongo = require('mongodb');
var logger = require('morgan');
var mongoose = require('mongoose');
var quickthumb = require('quickthumb');

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

//Middlewares
app.use(logger())
app.use(stormpathMiddleware)
app.use('/images', stormpath.loginRequired, quickthumb.static(__dirname + '/images'));

//Connect to db
//mongoose.connect('mongodb://localhost/webapp', function(err) {
mongoose.connect('mongodb://gushan:gs524410@ds061721.mongolab.com:61721/finalproject', function(err) {
	if (err) {
		console.log('connection error', err)
	} else {
		console.log('connection successful')
	}
})

app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});

app.use('/profile', stormpath.loginRequired, require('./profile')());

app.use('/newpost', stormpath.loginRequired, require('./newpost'));

app.listen(3000);