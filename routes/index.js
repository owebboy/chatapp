var express = require('express');
var passport = require('passport');
var ColorHash = require('color-hash');
var colorHash = new ColorHash()

var router = express.Router();
var User = require('../models/user');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'chatapp', user: req.user });
});

/* POST Register */
router.post('/register', function(req, res, next) {
  User.register(new User({username: req.body.username, color: colorHash.hex(req.body.username)}), req.body.password, function(err) {
    if (err) return next(err);
    res.redirect('/');
  });
});

/* POST Login */
router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});

router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});


module.exports = router;
