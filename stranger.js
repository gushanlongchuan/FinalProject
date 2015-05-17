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

router.get('/:strangername', function(req, res){
	var name = req.params.strangername
	Post.find({Username: name},function(err, results){
		if (err) return err
		else res.render('stranger', {results : results, name:name})
	});
});

module.exports = router;