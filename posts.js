
var express = require('express');
var csurf = require('csurf');
var stormpath = require('express-stormpath');
var stormpathAPI = require('stormpath');
var extend = require('xtend');
var _ = require('underscore');
var moment = require('moment');
var Post = require('./module/post_table.js');
var Comment = require('./module/comment_table.js');
var Notif = require('./module/notif_table.js');
var Like = require('./module/like_table.js');

var router = express.Router();

// Use csurf for token
router.use(csurf({ sessionKey: 'stormpathSession' }));

// Create Stormpath client to interact with the Stormpath API
var client;
stormpathAPI.loadApiKey('apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties', function apiKeyFileLoaded(err, apiKey) {
	client = new stormpathAPI.Client({apiKey: apiKey});
});

// Initialize variable containing data to pass to view
var topass = {}

//Process POST
router.post('/', stormpath.loginRequired, function(req, res, locals) {

	id = req.originalUrl.split("/")[2]
	U_id = req.user.href.split("/")[5]

	// if button BUY
	if (req.body.type == "buy") {
		topass[req.user.href]['saved'] = true
		topass[req.user.href]['sold'] = true
		// Update Status of the item
		Post.findOne({ _id: id }, function(err, post) {
			post.Status = 1
			post.save();
		})
		// Send notif to seller if not buyer
		if (topass[req.user.href].post_data.User_id != topass[req.user.href].user_data.User_id.split("/")[5]) {
			newnotif = {
				User_id: topass[req.user.href].post_data.User_id,
				Message: topass[req.user.href].user_data.Username +" bought your item: " + topass[req.user.href].post_data.Title_of_post,
				Url: req.originalUrl
			}
			Notif.create(newnotif, function(err, notif) {
				console.log(notif)		
				// Emit socket for realtime
				if (req.current_connections["https://api.stormpath.com/v1/accounts/" + topass[req.user.href].post_data.User_id]) {
					console.log("sending notifification")
					req.current_connections["https://api.stormpath.com/v1/accounts/" + topass[req.user.href].post_data.User_id].emit('newnotif', notif)
				}
			})
		}

	// if button COMMENT
	} else if (req.body.type == "comment") {
		
		//Create new comment
		newcomment = {
			Post_id: req.originalUrl.split("/")[2],
			User_id: req.user.href,
			Username: req.user.givenName.charAt(0).toUpperCase() + req.user.givenName.toLowerCase().slice(1) + ' ' + req.user.surname.charAt(0).toUpperCase() + req.user.surname.toLowerCase().slice(1),
			Content: req.body.comment
		}
		//Insert it in the DB
		Comment.create(newcomment, function(err, comment) {
			console.log(comment)
			if (err) {
				console.log(err)
			}
		})
		//Add it to the data to pass to the view
		topass[req.user.href].post_data.Comments.push({
			user_id: newcomment.User_id.split("/")[5],
			user_name: newcomment.Username,
			user_pic: req.user.customData.profile_pic || 'images/default_profile.jpg',
			text: newcomment.Content
		})
		// Send notif to seller if not commenter
		if (topass[req.user.href].post_data.User_id != topass[req.user.href].user_data.User_id.split("/")[5]) {
			newnotif = {
				User_id: topass[req.user.href].post_data.User_id,
				Message: topass[req.user.href].user_data.Username +" commented on your item: " + topass[req.user.href].post_data.Title_of_post,
				Url: req.originalUrl
			}
			Notif.create(newnotif, function(err, notif) {
				console.log(notif)		
				// Emit socket for realtime
				if (req.current_connections["https://api.stormpath.com/v1/accounts/" + topass[req.user.href].post_data.User_id]) {
					console.log("sending notifification")
					req.current_connections["https://api.stormpath.com/v1/accounts/" + topass[req.user.href].post_data.User_id].emit('newnotif', notif)
				}
			})
		}

	// if button LIKE
	} else if(req.body.type == "like") {
		var like = {
			Liker_id: U_id,
			Post_id: id
		}
		Like.create(like, function(err, like_result){
			if (err) console.log(err)
			topass[req.user.href].post_data.Likes += 1;
			topass[req.user.href].post_data.Has_liked = 'true';
			res.render('posts', extend(topass[req.user.href],locals||{}))
		})
	}
	if(req.body.type != "like")
		res.render('posts', extend(topass[req.user.href],locals||{}))
})

//Process GET
router.get('/', stormpath.loginRequired, function(req, res, locals) {

	U_id = req.user.href.split("/")[5]
	// Search for post in the DB
	id = req.originalUrl.split("/")[2]
	Post.findOne({ _id: id }, function(err, post) {
		// Handle error
		if (err) {
			console.log(err)
		}
		Like.find({Post_id: id}, function(err, count_like){
			if (err) return err;
			var has_liked = 'false';
			count_like.forEach(function (eachlike, idx){
				if (eachlike.Liker_id == U_id) {
					has_liked = 'true';
				}
			})
		// Get info about the seller
			client.getResource(post.User_id+'/customData', function(err, sellerData) {

				// Data to pass to view
				topass[req.user.href] = {
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
						Title_of_post: post.Title_of_post,
						Description: post.Description,
						Price: post.Price,
						Image_path: post.Image_path,
						Time: moment(post.TimeStamp).format('MMMM Do') + ' at ' +  moment(post.TimeStamp).format('h:mm a'),
						User_id: post.User_id.split("/")[5],
						Username: post.Username,
						User_pic: sellerData.profile_pic || 'images/default_profile.jpg',
						Likes: count_like.length,
						Has_liked: has_liked, 
						Comments: []
					},
					csrfToken: req.csrfToken()
				}

				// If sold
				if (post.Status) {
					topass[req.user.href]['sold'] = true
				}

				//Get comments
				Comment.find({ Post_id: id }, function(err, comments) {
					//For each comment
					comments.forEach(function(com, idx) {
						//Get user's customData
						client.getResource(com.User_id+'/customData', function(err, commenterData) {
							//Pass to view
							topass[req.user.href].post_data.Comments.push({
								user_id: com.User_id.split("/")[5],
								user_name: com.Username,
								user_pic: commenterData.profile_pic || 'images/default_profile.jpg',
								text: com.Content
							})
							if (topass[req.user.href].post_data.Comments.length == comments.length) {
								res.render('posts', extend(topass[req.user.href],locals||{}))
							}
						})
					})
					// Render to the view all the information about the post and the seller
					if (comments.length == 0) {
						res.render('posts', extend(topass[req.user.href],locals||{}))
					}
				})
			})
		})
	})
})

module.exports = router;
