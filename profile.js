
var express = require('express');
var forms = require('forms');
var csurf = require('csurf');
var multer = require('multer');
var collectFormErrors = require('express-stormpath/lib/helpers').collectFormErrors;
var stormpath = require('express-stormpath');
var extend = require('xtend');

// Declare the schema of our form:

var profileForm = forms.create({
  givenName: forms.fields.string({
    required: true
  }),
  surname: forms.fields.string({ required: true }),
  streetAddress: forms.fields.string(),
  city: forms.fields.string(),
  state: forms.fields.string(),
  zip: forms.fields.string()
});

// A render function that will render our form and
// provide the values of the fields, as well
// as any situation-specific locals

function renderForm(req,res,locals){
  res.render('profile', extend({
    title: 'My Profile',
    csrfToken: req.csrfToken(),
    givenName: req.user.givenName,
    surname: req.user.surname,
    streetAddress: req.user.customData.streetAddress,
    city: req.user.customData.city,
    state: req.user.customData.state,
    zip: req.user.customData.zip
  },locals||{}));
}

// Export a function which will create the
// router and return it

module.exports = function profile(){

  var router = express.Router();

  // Use multer for file upload
  router.use(multer({ dest: './images/'}))
  // Use csurf for token
  router.use(csurf({ sessionKey: 'stormpathSession' }));

  // Capture all requests, the form library will negotiate
  // between GET and POST requests

  router.all('/', function(req, res, locals) {
    profileForm.handle(req,{
      success: function(form){
        // The form library calls this success method if the
        // form is being POSTED and does not have errors

        // The express-stormpath library will populate req.user,
        // all we have to do is set the properties that we care
        // about and then cal save() on the user object:
        req.user.givenName = form.data.givenName;
        req.user.surname = form.data.surname;
        req.user.customData.streetAddress = form.data.streetAddress;
        req.user.customData.city = form.data.city;
        req.user.customData.state = form.data.state;
        req.user.customData.zip = form.data.zip;
        req.user.customData.profile_pic = req.files.image.path;
        req.user.save(function(err){
          if(err){
            if(err.developerMessage){
              console.error(err);
            }
            renderForm(req,res,extend({
              errors: [{
                error: err.userMessage ||
                err.message || String(err)
              }]
            }, locals||{}));
          }else{
            renderForm(req,res,extend({
              saved:true
            }, locals||{}));
          }
        });
      },
      error: function(form){
        // The form library calls this method if the form
        // has validation errors.  We will collect the errors
        // and render the form again, showing the errors
        // to the user
        renderForm(req,res,extend({
          errors: collectFormErrors(form)
        }, locals||{}));
      },
      empty: function(){
        // The form library calls this method if the
        // method is GET - thus we just need to render
        // the form
        renderForm(req,res,locals);
      }
    });
  });

  // This is an error handler for this router

  router.use(function (err, req, res, next) {
    // This handler catches errors for this router
    if (err.code === 'EBADCSRFTOKEN'){
      // The csurf library is telling us that it can't
      // find a valid token on the form
      if(req.user){
        // session token is invalid or expired.
        // render the form anyways, but tell them what happened
        renderForm(req,res,extend({
          errors:[{error:'Your form has expired.  Please try again.'}]
        }, locals||{}));
      }else{
        // the user's cookies have been deleted, we dont know
        // their intention is - send them back to the home page
        res.redirect('/');
      }
    }else{
      // Let the parent app handle the error
      return next(err);
    }
  });

  return router;
};