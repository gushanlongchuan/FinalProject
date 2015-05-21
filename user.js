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
var Post = require('./module/post_table.js')
var stormpathAPI = require('stormpath');
var Comment = require('./module/comment_table.js')
var moment = require('moment');
var csurf = require('csurf');
var Friend = require('./module/Friend_table.js')

var client;
stormpathAPI.loadApiKey('apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties', function apiKeyFileLoaded(err, apiKey) {
	client = new stormpathAPI.Client({apiKey: apiKey});
});

var testPass=[];
var Pass=[];
router.post('/', stormpath.loginRequired, function(req, res) {
	id = req.body.post_id;
	var post_num = req.body.posts;
	var following_num = req.body.following;
	var followee_num = req.body.followers;
	
	var User_pic = req.user.customData.profile_pic
	if(req.body.type == "delete"){
		Post.remove({_id:id},function(err, leftover){
			if(err) return err;
			testPass.forEach(function(eachPost, idx) {
				if(eachPost.post_id == id){
					testPass.splice(idx, 1);
				}
			})
			post_num = post_num - 1;
			res.render('user', {result:testPass,User_pic:User_pic,posts:post_num,following:following_num,followers:followee_num})
		})
	}
	else{
		newcomment = {
			Post_id: id,
			User_id: req.user.href,
			Username: req.user.givenName.charAt(0).toUpperCase() + req.user.givenName.toLowerCase().slice(1) + ' ' + req.user.surname.charAt(0).toUpperCase() + req.user.surname.toLowerCase().slice(1),
			Content: req.body.comment
		}
			//Insert it in the DB
		Comment.create(newcomment, function(err, comment) {
			if (err) {
					console.log(err)
			}
		})
		
		testPass.forEach(function(eachPost, idx) {
			if(eachPost.post_id == id){
				eachPost.content.post_data.Comments.push({
					user_id: newcomment.User_id.split("/")[5],
					user_name: newcomment.Username,
					user_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
					text: newcomment.Content
				})
			}
		})
		res.render('user', {result:testPass,User_pic:User_pic,posts:post_num,following:following_num,followers:followee_num})
	}
});


router.get('/', function(req, res) {
	var U_id = req.user.href.split("/")[5];
	testPass = [];
	Post.find({User_id: 'https://api.stormpath.com/v1/accounts/' + U_id},function(err, results){
		var User_pic = req.user.customData.profile_pic
		
		var post_num = results.length;
		if (User_pic == undefined || !User_pic) User_pic = 'images/default_profile.jpg';
		if (err) return err;
		Friend.count({User_id:U_id}, function(err,following){
			var following_num = following;
			Friend.count({Friend_id:U_id}, function(err,followee){
				var followee_num = followee;
				if (results.length == 0){
					res.render('user', {posts:post_num,following:following_num,followers:followee_num,User_pic:User_pic})
				}
				results.forEach(function(eachPost, idx) {
					var topass;
					topass = {
						// Title of the page
						title: 'Posts',
						// Current user data
						user_data: {
							User_id: req.user.href,
							Username: req.user.givenName.charAt(0).toUpperCase() + req.user.givenName.toLowerCase().slice(1) + ' ' + req.user.surname.charAt(0).toUpperCase() + req.user.surname.toLowerCase().slice(1),
							User_pic: req.user.customData.profile_pic || 'images/default_profile.jpg'
						},
						// Data of the post being viewed
						post_data: {
							Title_of_post: eachPost.Title_of_post,
							Description: eachPost.Description,
							Price: eachPost.Price,
							Image_path: eachPost.Image_path,
							Time: moment(eachPost.TimeStamp).format('MMMM Do') + ' at ' +  moment(eachPost.TimeStamp).format('h:mm a'),
							User_id: eachPost.User_id.split("/")[5],
							Username: eachPost.Username,
							User_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
							_id: eachPost._id,
							Status:eachPost.Status,
							Comments: []
						},
						//csrfToken: req.csrfToken()
					}	
					
					Comment.find({ Post_id: eachPost._id }, function(err, comments) {
						if (comments.length == 0) {
							testPass.push({
								post_id:eachPost._id,
								content:topass
							})
							if(testPass.length == results.length){
								res.render('user', {result:testPass,followers:followee_num, following:following_num, posts:post_num})
							}
						}
						else{
							comments.forEach(function(com, idx) {
								//Get user's customData
								client.getResource(com.User_id+'/customData', function(err, commenterData) {
									
									topass.post_data.Comments.push({
										user_id: com.User_id.split("/")[5],
										user_name: com.Username,
										user_pic: commenterData.profile_pic || 'images/default_profile.jpg',
										text: com.Content
									})
									if (topass.post_data.Comments.length == comments.length){
										testPass.push({
											post_id:eachPost._id,
											content:topass
										})
									}
									if(testPass.length == results.length && topass.post_data.Comments.length == comments.length){
										res.render('user', {posts:post_num,following:following_num,followers:followee_num,User_pic:User_pic,result:testPass})
									}
								})
							})
						}
					})
				})
			})
		})
	});
});	

module.exports = router;