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
var topass=[];

router.post('/', stormpath.loginRequired, function(req, res, locals) {
	id = req.body.post_id;
	var post_num = req.body.posts;
	var following_num = req.body.following;
	var followee_num = req.body.followers;
	var User_pic = req.user.customData.profile_pic
	if(req.body.type == "delete"){
		Post.remove({_id:id},function(err, leftover){
			if(err) return err;
			testPass.forEach(function(result, idx) {
				if(result.post_id == id){
					testPass.splice(idx, 1);
				}
			})
			post_num = post_num - 1;
			res.render('user', extend({result:testPass,User_pic:User_pic,posts:post_num,following:following_num,followers:followee_num}, locals||{}))
		})
	}
	/*else if(req.type == "comment"){
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
		
		topass.post_data.Comments.push({
			user_id: newcomment.User_id.split("/")[5],
			user_name: newcomment.Username,
			user_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
			text: newcomment.Content
		})
		res.render('user_post', extend({topass:topass},locals||{}))
	}*/
});

router.post('/:post_id',function(req,res,locals){
	
	var id = req.params.post_id;
	if(req.body.type == "comment"){
		console.log("11111")
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
		
		topass.post_data.Comments.push({
			user_id: newcomment.User_id.split("/")[5],
			user_name: newcomment.Username,
			user_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
			text: newcomment.Content
		})
		res.render('user_post', extend({topass:topass},locals||{}))
	}
})

router.get('/', function(req, res, locals) {
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
					res.render('user', extend({posts:post_num,following:following_num,followers:followee_num,User_pic:User_pic}, locals||{}))
				}
				results.forEach(function(result, idx) {
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
							Title_of_post: result.Title_of_post,
							Description: result.Description,
							Price: result.Price,
							Image_path: result.Image_path,
							Time: moment(result.TimeStamp).format('MMMM Do') + ' at ' +  moment(result.TimeStamp).format('h:mm a'),
							User_id: result.User_id.split("/")[5],
							Username: result.Username,
							User_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
							_id: result._id,
							Status:result.Status,
							Comments: []
						},
						//csrfToken: req.csrfToken()
					}	
					
					Comment.find({ Post_id: result._id }, function(err, comments) {
						if (comments.length == 0) {
							testPass.push({
								post_id:result._id,
								content:topass
							})
							if(testPass.length == results.length){
								res.render('user', extend({result:testPass,followers:followee_num, following:following_num, posts:post_num}, locals||{}))
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
											post_id:result._id,
											content:topass
										})
									}
									if(testPass.length == results.length && topass.post_data.Comments.length == comments.length){
										res.render('user', extend({posts:post_num,following:following_num,followers:followee_num,User_pic:User_pic,result:testPass}, locals||{}))
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

router.get('/:post_id',function(req,res,locals){
	topass = [];
	var post_id = req.params.post_id;
	Post.findOne({_id:post_id}, function(err, result){
		if (err) return err;
		topass = {
			title: 'Posts',
			user_data: {
				User_id: req.user.href,
				Username: req.user.givenName.charAt(0).toUpperCase() + req.user.givenName.toLowerCase().slice(1) + ' ' + req.user.surname.charAt(0).toUpperCase() + req.user.surname.toLowerCase().slice(1),
				User_pic: req.user.customData.profile_pic || 'images/default_profile.jpg'
			},
			post_data: {
				Title_of_post: result.Title_of_post,
				Description: result.Description,
				Price: result.Price,
				Image_path: result.Image_path,
				Time: moment(result.TimeStamp).format('MMMM Do') + ' at ' +  moment(result.TimeStamp).format('h:mm a'),
				User_id: result.User_id.split("/")[5],
				Username: result.Username,
				User_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
				_id: result._id,
				Status:result.Status,
				Comments: []
			},
			//csrfToken: req.csrfToken()
		}
		Comment.find({ Post_id: post_id }, function(err, comments) {
			comments.forEach(function(com, idx) {
				client.getResource(com.User_id+'/customData', function(err, commenterData) {
					topass.post_data.Comments.push({
						user_id: com.User_id.split("/")[5],
						user_name: com.Username,
						user_pic: commenterData.profile_pic || 'images/default_profile.jpg',
						text: com.Content
					})
					if (topass.post_data.Comments.length == comments.length) {
						res.render('user_post', extend({topass:topass},locals||{}))
					}
				})
			})
			if (comments.length == 0) {
				res.render('user_post', extend({topass:topass},locals||{}))
			}
		})
	})
})
module.exports = router;