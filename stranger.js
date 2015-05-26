var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var multer = require('multer');
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var extend = require('xtend');
var _ = require('underscore');
var router = express.Router();
var mongoose = require("mongoose");
var Post = require('./module/post_table.js')
var stormpathAPI = require('stormpath');
var Friend = require('./module/Friend_table.js')

var client;
stormpathAPI.loadApiKey('apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties', function apiKeyFileLoaded(err, apiKey) {
	client = new stormpathAPI.Client({apiKey: apiKey});
});

router.get('/:stranger_id', function(req, res, locals){
	var Stranger_id = req.params.stranger_id;
	var s_id;
	client.getResource('https://api.stormpath.com/v1/accounts/'+Stranger_id, function(err, strangerData){
		console.log(strangerData)
		s_id = strangerData.href;
		Post.find({User_id: s_id},function(err, results){
			var U_id = req.user.href.split("/")[5];
			var post_num = results.length;
			var clickable;
			if (err) return err
			else {
				Friend.find({User_id:U_id, Friend_id:Stranger_id}, function(err, result){
					if (result.length == 0) clickable = "true";
					else clickable = "false";
					client.getResource(strangerData.customData.href, function(err, sCustomData){
						var image_path = sCustomData.profile_pic;
						if (image_path == undefined) image_path = 'images/default_profile.jpg';
						Friend.count({User_id:Stranger_id}, function(err,following){
							var following_num = following;
							Friend.count({Friend_id:Stranger_id}, function(err,followee){
								var followee_num = followee;
								res.render('stranger', extend({
									title: 'Stranger profile',
									results : results,
									clickable:clickable,
									strangerData: strangerData,
									User_pic:image_path,
									followers:followee_num,
									following:following_num,
									posts:post_num
								}, locals||{}))
							})
						})
					})
				})
			}
		})
	})
})

//add follow relationship
router.post('/:stranger_id', function(req, res, locals){
	var Stranger_id = req.params.stranger_id;
	var user_id = req.user.href.split("/")[5];
	var post_num = req.body.posts;
	var following_num = req.body.following;
	var followee_num = parseInt(req.body.followers, 10);	
	var usrname = req.user.fullName;
	var Usr_pic = req.user.customData.profile_pic || 'images/default_profile.jpg';
	if(req.body.button1 == "follow"){
		client.getResource('https://api.stormpath.com/v1/accounts/'+Stranger_id, function(err, strangerData){
			var S_username = strangerData.fullName;
			var s_id = strangerData.href;
			client.getResource(strangerData.customData.href, function(err,strangerCData){
				
				var User_pic = strangerCData.profile_pic;
				if (User_pic == undefined) User_pic = 'images/default_profile.jpg';
				var followship = {
					User_id: user_id,
					Friend_id: Stranger_id,
					Username: usrname,
					Friendname: S_username,
					User_picture:Usr_pic,
					Friend_picture:User_pic
				}
				Friend.create(followship, function(err, Friend){
					var clickable = "false"
					if (err) return console.log(err)
					else {
						Post.find({User_id: s_id},function(err, results){
							var clickable = "false"
							if (err) return err
							else {
								client.getResource(strangerData.customData.href, function(err, sCustomData){
									var image_path = sCustomData.profile_pic;
									if (image_path == undefined) image_path = 'images/default_profile.jpg';
									followee_num = followee_num + 1;
									res.render('stranger', extend({
										title: 'Stranger profile',
										results : results,
										clickable:clickable,
										strangerData: strangerData,
										User_pic:image_path,
										followers:followee_num,
										following:following_num,
										posts:post_num
									}, locals||{}))
								})
							}
						})
					}
				})
			})
		})
	}
	else if(req.body.button1 == "following"){
		var s_id = req.body.stranger_href;
		var user_pic = req.body.user_pic;
		var results = [];
		Friend.remove({ User_id: user_id, Friend_id:Stranger_id}, function(err){
			clickable = "true";
			client.getResource(s_id, function(err, strangerData){
				var image_path = user_pic;
				followee_num = followee_num - 1;
				Post.find({User_id: s_id},function(err, results){
					if (err) return err;
					else res.render('stranger', extend({
						title: 'Stranger profile',
						results : results,
						clickable:clickable,
						strangerData: strangerData,
						User_pic:image_path,
						followers:followee_num,
						following:following_num,
						posts:post_num
					}, locals||{}))
				});	
			})
		})
	}
});

module.exports = router;