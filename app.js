
var http = require('http');
var express = require('express');
var stormpath = require('express-stormpath');
var mongo = require('mongodb');
var logger = require('morgan');
var mongoose = require('mongoose');
var quickthumb = require('quickthumb');
var Notif = require('./module/notif_table.js');

var app = express();

var server = http.Server(app);
var io = require('socket.io')(server);
server.listen(3000);

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

// Handle routes
app.get('/', function(req, res) {
  res.render('home', {
    title: 'Welcome'
  });
});

io.on('connection', function ( socket ) {
  console.log('yessss')
  //socket.emit('connect', { hello: 'world' });
  socket.on('notif', function (notif_id) {
    console.log(notif_id);
    Notif.find({_id: notif_id.id}).remove(function(err, result) {})
  });
    
});

// Use middleware for layout notifications
app.use(stormpath.loginRequired, function(req, res, next) {

  Notif.find({User_id: req.user.href.split("/")[5]}, function(err, notifs) {
    if (notifs.length > 0) {
      res.locals['notifs'] = []
    }
    notifs.forEach(function(notif, idx) {
      res.locals.notifs.push({
        message: notif.Message,
        url: notif.Url,
        id: notif._id
      })
    })
  })
  next()
})

app.use('/home',stormpath.loginRequired,require('./loginhome'));
app.use('/profile',stormpath.loginRequired,require('./profile')());
app.use('/user',stormpath.loginRequired,require('./user'));
app.use('/newpost',stormpath.loginRequired,require('./newpost'));
app.use('/stranger',stormpath.loginRequired,require('./stranger'));
app.use('/posts/:id', stormpath.loginRequired, require('./posts'));
app.use('/discover',stormpath.loginRequired,require('./discover'));
//app.listen(3000);