var express = require('express');
var stormpath = require('stormpath');
var csurf = require('csurf');
var extend = require('xtend');
var Post = require('./module/post_table.js');
var Friend = require('./module/Friend_table.js')

var router = express.Router();

var client = null;
var keyfile = './apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties';
var application = null;

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals

function renderForm(req,res,locals){
  res.render('discover', extend({
    title: 'Discover Page',
    csrfToken: req.csrfToken(),
  },locals||{}));
}

// Use csurf for token
router.use(csurf({ sessionKey: 'stormpathSession' }));

router.route('/')
	.get(function(req,res,next){
      var userList = new Array();
      var path;
      var discList = new Array();
      
      //var index = 0;
      
  		req.app.get('stormpathApplication').getAccounts(function(err, accounts) {
    		if (err) return next(err);
    		
        // Get all users from stormpath and list them
        var i = 0;
        var items = accounts.items;
        console.log(items);
        for(i=0;i<items.length;i++){
           var account = items[i];
           console.log(account.username);
           console.log(account.href);
           //userList.push(account.username);
           userList[i] = account.href;
        }
        
        var j = 0;
        var friendList = new Array();
        var count = 0;
        var tot = 0;
        var disc = 0;
        var U_id = req.user.href.split("/")[5];
        var k = 0;
        for(j=0;j<i;j++){
           var oneURL = userList[j];
           var other_id = oneURL.split("/")[5];
           Friend.find({User_id:U_id, Friend_id:other_id}, function(err, result){
              if (result.length != 0){
                friendList[count] = result.Friend_id;
                console.log("other id inside is: "+nonfriendList[count]+"count is "+count);
                count = count + 1;
              }
              tot = tot + 1;
              if(tot == i){
                tot = 0;
                for(k=0;k<i;k++){
                  var part_id = userList[k].split("/")[5];
                  if (friendList.indexOf(part_id) < 0) {
                    Post.findOne({ User_id: userList[k]}, function(err, result) {
                      if (err) 
                        return console.error(err);
                      if(result != null){
                        discList[disc] = result.Image_path;
                        console.log(discList)
                        disc = disc + 1;
                      }
                      tot = tot + 1;
                      console.log(tot+" and "+i);
                      if((disc == 10)||(tot == i)){
                        renderForm(req,res,{
                          dis: true,
                          user: userList,
                          images: discList
                          // user2: userList[1],
                          // user3: userList[2],
                          // user4: userList[3],
                        });
                      }
                    });
                  } else {
                    tot = tot + 1;
                  }
                }
              }
           });
        }
        //console.log(nonfriendList);

        // Need to pick each user's latest posts
        // Post.findOne({ User_id: userList[0]}, function(err, result) {
        //   if (err) 
        //     return console.error(err);
        //   path = result.Image_path;
        //   console.log(result);

        //   renderForm(req,res,{
        //     dis: true,
        //     user1: userList[0],
        //     user2: userList[1],
        //     user3: userList[2],
        //     user4: userList[3],
        //     Image_path: path
        //   });
          
        // });
  		});
	});

module.exports = router;