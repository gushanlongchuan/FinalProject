
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

//Process GET
router.get('/', stormpath.loginRequired, function(req, res, locals) {

	U_id = req.user.href.split("/")[5]
	kw = req.originalUrl.split("/")[2].replace('%20', ' ')
	re = new RegExp(kw, 'i')
	Post.find().or([
		{Title_of_post: { $regex: re }},
		{Description: { $regex: re }},
		{Username: { $regex: re }}
	]).exec(function(err, out) {
		topass = {
			title: 'Search results',
			kw: kw,
			results: []
		}
		out.forEach(function(oneres, idx) {
			client.getResource(oneres.User_id+'/customData', function(err, sellerData) {
				topass.results.push({
					User_id: oneres.User_id.split("/")[5],
					Title_of_post: oneres.Title_of_post,
					Description: oneres.Description,
					Price: oneres.Price,
					Username: oneres.Username,
					_id: oneres._id,
					Image_path: oneres.Image_path,
					profile_pic: sellerData.profile_pic || 'images/default_profile.jpg'
				})
				if (topass.results.length == out.length) {
					res.render('search', extend(topass,locals||{}))
				}
			})
		})
		if (out.length == 0) {
			res.render('search', extend(topass,locals||{}))
		}
	})
})

module.exports = router;
