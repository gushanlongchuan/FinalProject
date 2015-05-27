var http = require('http');
var express = require('express');
var stormpath = require('express-stormpath');
var logger = require('morgan');
var extend = require('xtend');
var mongoose = require('mongoose');
var quickthumb = require('quickthumb');
var extend = require('xtend');
var favicon = require('serve-favicon');
var Notif = require('./module/notif_table.js');
var Post = require('./module/post_table.js');
var Friend = require('./module/Friend_table.js')

var app = express();

var current_connections = {}
var server = http.Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000);
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
app.use(favicon(__dirname + '/public/favicon.ico'));
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
app.use(function(req, res, next) {

  if (req.user) {
    //Push profile pic
    res.locals['profile_pic'] = req.user.customData.profile_pic || 'images/default_profile.jpg'
    res.locals['user_id'] = req.user.href
    res.locals['user_nice_name'] = req.user.givenName.charAt(0).toUpperCase() + req.user.givenName.toLowerCase().slice(1) + ' ' + req.user.surname.charAt(0).toUpperCase() + req.user.surname.toLowerCase().slice(1)
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
  } else {
    next()
  }
})

// Use middleware to handle searches
app.use(function(req, res, next) {
  if (req.body.type == "search") {
    res.redirect('/search/' + req.body.search)
  } else {
    next()
  }
})

function renderForm(req,res,locals){
  res.render('home', extend({
    title: 'InsTrade',
  },locals||{}));
}

// Handle routes
app.get('/', function(req, res, locals) {

  req.app.get('stormpathApplication').getAccounts(function(err, accounts) {
    if (err) return next(err);

    if (!req.user) {
      renderForm(req,res,locals||{});
      return;
    }

    if (accounts == null) {
      renderForm(req,res,locals||{});
      return;
    }
    var friendList = new Array();
    var count = 0;
    postIdList = new Array();
    urlList = new Array();
    titleList = new Array();
    timestampList = new Array();
    usernameList = new Array();
    useridList = new Array();
    priceList = new Array();
    friendImageList = new Array();
    itemUserImage = new Array();
    var selfId = req.user.href.split("/")[5];

    Friend.find({User_id:selfId},function(err,results){
      for(var i = 0; i < results.length; i++) {
        friendList[i] = results[i].Friend_id;
        friendImageList[i] = results[i].Friend_picture;
      }

      Post.find({}, {}, { sort: { 'TimeStamp' : -1 } }, function(err, timeFindResults) {
        for(var i = 0; i < timeFindResults.length; i++) {
          for(var j = 0; j < friendList.length; j++) {
            if (timeFindResults[i].User_id.split("/")[5] == friendList[j]) {
              postIdList[count] = timeFindResults[i]._id;
              urlList[count] = timeFindResults[i].Image_path;
              titleList[count] = timeFindResults[i].Title_of_post;
              timestampList[count] = timeFindResults[i].TimeStamp;
              usernameList[count] = timeFindResults[i].Username;
              priceList[count] = timeFindResults[i].Price;
              useridList[count] = timeFindResults[i].User_id.split("/")[5];
              itemUserImage[count] = friendImageList[j];
              count++;
              break;
            }
          }
          //if (count == 10)
          //  break;
        }

        renderForm(req,res,extend({
          title: 'InsTrade',
          posts: postIdList,
          images: urlList,
          titles: titleList,
          timestamps: timestampList,
          usernames: usernameList,
          userids: useridList,
          prices: priceList,
          itemuserimages: itemUserImage
        }, locals||{}));
      });
    });
  });
});

app.use('/search/:kw', stormpath.loginRequired, require('./search'));
app.use('/profile',stormpath.loginRequired,require('./profile')());
app.use('/user',stormpath.loginRequired,require('./user'));
app.use('/newpost',stormpath.loginRequired,require('./newpost'));
app.use('/stranger',stormpath.loginRequired,require('./stranger'));
app.use('/posts/:id', stormpath.loginRequired, require('./posts'));
app.use('/discover',stormpath.loginRequired,require('./discover'));
