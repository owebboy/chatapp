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
        url: "mongodb://localhost/chat"
    })
});

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

var io = app.io = require("socket.io")();
io.use(function(socket, next) {
  sessionMiddleware(socket.request, {}, next);
})
io.on("connection", function(socket) {
  console.log(socket.request.session.passport);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(sessionMiddleware)
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

const User = require('./models/user');

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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
