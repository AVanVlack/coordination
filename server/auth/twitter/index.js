'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router
  .get('/', function(req, res){
    req.session.returnTo = req.url
    passport.authenticate('twitter', {
      failureRedirect: '/signup',
      session: false
    })(req, res);
  })

  .get('/callback', passport.authenticate('twitter', {
    failureRedirect: '/signup',
    session: false
  }), auth.setTokenCookie);

module.exports = router;
