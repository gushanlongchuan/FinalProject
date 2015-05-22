
var http = require('http');
var express = require('express');
var stormpath = require('express-stormpath');
var mongo = require('mongodb');
var logger = require('morgan');
var mongoose = require('mongoose');
var quickthumb = require('quickthumb');
var extend = require('xtend');
var Notif = require('./module/notif_table.js');
var Post = require('./module/post_table.js');
var Friend = require('./module/Friend_table.js')

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

function renderForm(req,res,locals){
  res.render('home', extend({
    title: 'home',
  },locals||{}));
}

// Handle routes
app.get('/', function(req, res) {

  req.app.get('stormpathApplication').getAccounts(function(err, accounts) {
    if (err) return next(err);

    if (!req.user) {
      renderForm(req,res,{});
      return;
    }
console.log("-----------------");
console.log(req.user.customData.profile_pic);
console.log("-----------------");
    if (accounts == null) {
      renderForm(req,res,{});
      return;
    }
    var friendList = new Array();
    var count = 0;
    postIdList = new Array();
    urlList = new Array();
    var selfId = req.user.href.split("/")[5];

    Friend.find({User_id:selfId},function(err,results){
      for(var i = 0; i < results.length; i++) {
        friendList[i] = results[i].Friend_id;
      }

      Post.find({}, {}, { sort: { 'TimeStamp' : -1 } }, function(err, timeFindResults) {
        for(var i = 0; i < timeFindResults.length; i++) {
          for(var j = 0; j < friendList.length; j++) {
            if (timeFindResults[i].User_id.split("/")[5] == friendList[j]) {
              postIdList[count] = timeFindResults[i]._id;
              urlList[count] = timeFindResults[i].Image_path;
              count++;
              break;
            }
          }
          if (count == 10)
            break;
        }

        var user_pic;
        if (!req.user.customData.profile_pic)
          user_pic = "images/default_profile.jpg";
        else
          user_pic = req.user.customData.profile_pic;
        renderForm(req,res,{
          posts: postIdList,
          images: urlList,
          profile_pic: user_pic
        });
      });
    });
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

  //Push profile pic
  res.locals['profile_pic'] = req.user.customData.profile_pic || 'images/default_profile.jpg'
  //Push notifications
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

app.use('/profile',stormpath.loginRequired,require('./profile')());
app.use('/user',stormpath.loginRequired,require('./user'));
app.use('/newpost',stormpath.loginRequired,require('./newpost'));
app.use('/stranger',stormpath.loginRequired,require('./stranger'));
app.use('/posts/:id', stormpath.loginRequired, require('./posts'));
app.use('/discover',stormpath.loginRequired,require('./discover'));
//app.listen(3000);