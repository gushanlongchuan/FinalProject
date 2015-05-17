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

router.get('/:username', function(req, res) {
	var name = req.params.username;
	console.log('this is username')
	Post.find({Username: name},function(err, results){
		if (err) return err
		else res.render('user', {results : results})
	});
});	

module.exports = router;