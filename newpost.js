
var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var multer = require('multer');
var stormpath = require('express-stormpath');
var extend = require('xtend');
var _ = require('underscore');
var Post = require('./module/post_table.js');

// Declare the schema of the form
var newpostForm = forms.create({
	Title_of_post: forms.fields.string({
		required: true
	}),
	Description: forms.fields.string({
		required: true
	}),
	Price: forms.fields.number({
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
			var path = "..\\"+req.files.image.path
			var newpost = _.extend(form.data, {
				Username: req.user.givenName.charAt(0).toUpperCase() + req.user.givenName.toLowerCase().slice(1) + ' ' + req.user.surname.charAt(0).toUpperCase() + req.user.surname.toLowerCase().slice(1),
				User_id: req.user.href,
				Image_path:path
			})
			Post.create(newpost, function (err, post) {
				console.log(post)
				if (err) {
					console.log(err)
				}
			})
			//show the user that his post has been saved
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

module.exports = router;
