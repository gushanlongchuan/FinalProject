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

var client;
stormpathAPI.loadApiKey('apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties', function apiKeyFileLoaded(err, apiKey) {
	client = new stormpathAPI.Client({apiKey: apiKey});
});

var testPass=[];
var Pass=[];
router.post('/:post_id', stormpath.loginRequired, function(req, res) {
	id = req.params.post_id;
	newcomment = {
		Post_id: req.originalUrl.split("/")[2],
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
	
	res.render('user', {result:testPass})
})

router.get('/:user_id', function(req, res) {
	var User_id = req.params.user_id;
	Pass=[];
	testPass = [];
	Post.find({User_id: 'https://api.stormpath.com/v1/accounts/' + User_id},function(err, results){
		var User_pic = req.user.customData.profile_pic
		if (User_pic == undefined) User_pic = 'images/default_profile.jpg';
		if (results.length == 0)
			res.render('user', {User_pic:User_pic})
		if (err) return err;
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
					Comments: []
				},
				//csrfToken: req.csrfToken()
			}	
			
			Comment.find({ Post_id: eachPost._id }, function(err, comments) {
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
							Pass.push(topass)
							testPass.push({
								post_id:eachPost._id,
								content:topass
							})
						}
							
						if(Pass.length == results.length && topass.post_data.Comments.length == comments.length){
							//res.render('user', {result : Pass})
							res.render('user', {result:testPass})
						}
					})
				})
			})
		})
	});
});	

module.exports = router;