'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');


var router = express.Router();

router
  .get('/', function(req, res, next) {
    req.session.returnTo = '/?hello'
    console.log(req.url);
    passport.authenticate('twitter', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.redirect('/login'); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.redirect('/' + '?somthing:here');
      });
    })(req, res, next);
  })

  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    successReturnToOrRedirect: '/',
    session: true
  }), auth.setTokenCookie);

module.exports = router;
