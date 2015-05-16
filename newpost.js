
var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var multer = require('multer');
var stormpath = require('express-stormpath');
var mongoose = require('mongoose');
var extend = require('xtend');
var _ = require('underscore');
var Post = require('./models/Post.js');

// Declare the schema of the form
var newpostForm = forms.create({
	title: forms.fields.string({
		required: true
	}),
	description: forms.fields.string({
		required: true
	}),
	price: forms.fields.number({
		required: true
	})
})

// Function to render the form
function renderForm(req, res, locals) {
	res.render('newpost', extend({
		title: 'New post',
		csrfToken: req.csrfToken(),
		givenName: req.user.givenName,
		surname: req.user.surname,
		streetAddress: req.user.customData.streetAddress,
		city: req.user.customData.city,
		state: req.user.customData.state,
		zip: req.user.customData.zip
	},locals||{}));
}

var router = express.Router();

// Use multer for file upload
router.use(multer({ dest: './images/'}))

// Use csurf for token
router.use(csurf({ sessionKey: 'stormpathSession' }));

//Process GET and POST
router.all('/', stormpath.loginRequired, function(req, res) {
	newpostForm.handle(req, {
		success: function(form) {
			//form posted			
			var newpost = _.extend(form.data, {
				username: req.user.username,
				givenName: req.user.givenName,
				surname: req.user.surname,
				images: req.files.image.path
			})
			console.log(req.files.image.path)
			Post.create(newpost, function (err, post) {
				if (err) {
					console.log(err)
				}
			})
			renderForm(req,res,{
				saved:true
			});
		},
		error: function(form) {
			//error in the form
			renderForm(req,res);
			console.log(form)
		},
		empty: function(form) {
			//no data in the form
			renderForm(req,res);
		}
	})
	
})

//Error handler for the router


module.exports = router;
