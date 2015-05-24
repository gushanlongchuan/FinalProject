var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var multer = require('multer');
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var extend = require('xtend');
var _ = require('underscore');
var router = express.Router();
var mongoose   = require("mongoose");
var stormpathAPI = require('stormpath');
var Post = require('./module/post_table.js');
var Friend = require('./module/Friend_table.js');
var Notif = require('./module/notif_table.js');

var client;
stormpathAPI.loadApiKey('apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties', function apiKeyFileLoaded(err, apiKey) {
	client = new stormpathAPI.Client({apiKey: apiKey});
});

function renderForm(req,res,locals){
  res.render('home', extend({
    title: 'home',
  },locals||{}));
}

// Use csurf for token
router.use(csurf({ sessionKey: 'stormpathSession' }));

router.route('/').get(function(req,res,locals){

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
          if (count == 10)
            break;
        }

        Notif.find({User_id: req.user.href.split("/")[5]}, function(err, notifs) {
          var user_pic;
          if (!req.user.customData.profile_pic)
            user_pic = "images/default_profile.jpg";
          else
            user_pic = req.user.customData.profile_pic;
          renderForm(req,res,extend({
            posts: postIdList,
            images: urlList,
            profile_pic: user_pic,
            titles: titleList,
            timestamps: timestampList,
            usernames: usernameList,
            userids: useridList,
            prices: priceList,
            notifs: notifs,
            itemuserimages: itemUserImage
          }, locals||{}));
        });
      });
    });
  });
});

module.exports = router;