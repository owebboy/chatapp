var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var expressSession = require("express-session");

var sessionMiddleware = expressSession({
    name: "COOKIE_NAME_HERE",
    secret: "COOKIE_SECRET_HERE",
    store: new (require("connect-mongo")(expressSession))({
        url: "mongodb://localhost/chat1"
    })
});

var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var io = app.io = require("socket.io")();
io.use(function(socket, next) {
  sessionMiddleware(socket.request, {}, next);
})

var allClients = []
io.on("connection", function(socket) {
  if (socket.request.session.passport == undefined) return
  var username = socket.request.session.passport.user;
  allClients.push(socket)

  socket.on('disconnect', function() {
    var i = allClients.indexOf(socket);
    allClients.splice(i, 1);
    socket.broadcast.emit('message/notification', socket.request.session.passport.user + ' left.' + allClients.length + ' online.')
  });

  socket.on('connection', function(data) {
      socket.broadcast.emit('message/notification', data.username + ' joined. ' + allClients.length + ' online.')
  })

  User.findOne({ username: username }).exec(function(err, user) {
    if (err) return socket.emit('err', err)
    socket.emit('user', user)
  })

  socket.on('message/get_all', function() {
    Message.find({}).populate('_author').exec(function(err, messages) {
      if (err) return socket.emit('err', err)
      for (var i = 0; i < messages.length; i++) {
        socket.emit('message/receive', messages[i])
      }
    })
  })

  socket.on('message/send', function(data) {
    Message.create({
      content: data.message,
      _author: data.user
    }, function(err, message) {
      if (err) return socket.emit('err', err)
      Message.populate(message, { path: '_author' }, function(err, message) {
        if (err) return socket.emit('err', err)
        io.emit('message/receive', message)
      })
    })
  })

});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(sessionMiddleware)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

var User = require('./models/user');
var Message = require('./models/message')

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect('mongodb://localhost/chat1')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
