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
var client;
stormpathAPI.loadApiKey('apiKey-212N7J7X3ZLZ23YTFP7OL972B.properties', function apiKeyFileLoaded(err, apiKey) {
	client = new stormpathAPI.Client({apiKey: apiKey});
});

router.get('/:user_id', function(req, res) {
	var User_id = req.params.user_id;
	var name;
	client.getResource('https://api.stormpath.com/v1/accounts/'+User_id, function(err, userData){
		name = userData.username
		Post.find({Username: name},function(err, results){
			if (err) return err
			else res.render('user', {results : result})
		});
	});
});	

module.exports = router;