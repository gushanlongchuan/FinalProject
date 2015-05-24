var http = require('http');
var express = require('express');
var stormpath = require('express-stormpath');
var mongo = require('mongodb');
var logger = require('morgan');
var extend = require('xtend');
var mongoose = require('mongoose');
var quickthumb = require('quickthumb');
var extend = require('xtend');
var Notif = require('./module/notif_table.js');
var Post = require('./module/post_table.js');
var Friend = require('./module/Friend_table.js')

var app = express();

var current_connections = {}
var server = http.Server(app);
var io = require('socket.io')(server);
server.listen(3000);
io.on('connection', function(socket) {
  socket.on('imhere', function(message) {
    current_connections[message.token] = socket
  })
  socket.on('notif', function(notif_id) {
    console.log(notif_id);
    Notif.find({_id: notif_id.id}).remove(function(err, result) {})
  });
})

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
app.use('/images', stormpath.loginRequired, quickthumb.static(__dirname + '/images'))
app.use(express.static('public'))

//Connect to db
mongoose.connect('mongodb://gushan:gs524410@ds061721.mongolab.com:61721/finalproject', function(err) {
	if (err) {
		console.log('connection error', err)
	} else {
		console.log('connection successful')
	}
})

// Use middleware for layout notifications
app.use(['/newpost', '/profile', '/user', 'stranger', '/posts/:id', '/discover'],stormpath.loginRequired, function(req, res, next) {

  //Push profile pic
  res.locals['profile_pic'] = req.user.customData.profile_pic || 'images/default_profile.jpg'
  res.locals['user_id'] = req.user.href
  //Push notifications
  Notif.find({User_id: req.user.href.split("/")[5]}, function(err, notifs) {
    if (notifs.length > 0) {
      res.locals['notifs'] = []
    }
    notifs.forEach(function(notif, idx) {
      res.locals.notifs.push({
        Message: notif.Message,
        Url: notif.Url,
        _id: notif._id
      })
    })
    req.current_connections = current_connections
    next()
  })
})

app.use('/',require('./home'));
app.use('/profile',stormpath.loginRequired,require('./profile')());
app.use('/user',stormpath.loginRequired,require('./user'));
app.use('/newpost',stormpath.loginRequired,require('./newpost'));
app.use('/stranger',stormpath.loginRequired,require('./stranger'));
app.use('/posts/:id', stormpath.loginRequired, require('./posts'));
app.use('/discover',stormpath.loginRequired,require('./discover'));
//app.listen(3000);

