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

router.get('/:stranger_id', function(req, res){
	var Stranger_id = req.params.stranger_id;
	var s_id;
	client.getResource('https://api.stormpath.com/v1/accounts/'+Stranger_id, function(err, strangerData){
		s_id = strangerData.href;
		Post.find({User_id: s_id},function(err, results){
			var clickable = "true"
			if (err) return err
			else res.render('stranger', {results : results, clickable:clickable})
		});
	});
});

router.post('/:stranger_id', function(req, res){
	var Stranger_id = req.params.stranger_id;
	var user_id = req.user.href.split("/")[5];
	var usrname = req.user.username;
	client.getResource('https://api.stormpath.com/v1/accounts/'+Stranger_id, function(err, strangerData){
		var S_username = strangerData.username;
		var s_id = strangerData.href;
		var followship = {
			User_id: user_id,
			Friend_id: Stranger_id,
			Username: usrname,
			Friendname: S_username
		}
		Friend.create(followship, function(err, Friend){
			console.log(Friend)
			var clickable = "false"
			if (err) return console.log(err)
			else {
				Post.find({User_id: s_id},function(err, results){
					var clickable = "false"
					if (err) return err
					else res.render('stranger', {results : results, clickable:clickable})
				});
			}
		})
	});
});

module.exports = router;