/**
 * Module dependencies.
 */

var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var fs = require('fs')
var swig = require('swig');
// var filter = require('./filters')(swig);
var routes = require('./routes');
var http = require('http');
var path = require('path');
var url = require('url');
var models = require('./models');


var app = express();

app.engine("html", swig.renderFile);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.use(express.bodyParser({uploadDir:'./public/_documents'}));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
app.use(app.router);

var mongoose = require('mongoose');
if ('development' == app.get('env')) {
	mongoose.connect('mongodb://localhost/ghostdrop');
  // app.set('db uri', 'localhost/dev');
  global_hostname = "http://192.168.1.254:3000"
}

// production only
if ('production' == app.get('env')) {
	mongoose.connect("mongodb://heroku:142c1110e852d30da001d296d0cdaebf@troup.mongohq.com:10000/app22068826");
  // app.set('db uri', 'n.n.n.n/prod');
    global_hostname = "http://ghostdrop.io"

}
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
  swig.setDefaults({ cache: false });
}

var ensureAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){return next()};
  res.redirect('/')
}

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  models.User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
    models.User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

app.get('/', routes.index);
app.post('/upload', routes.create_doc);
app.get('/success', routes.success);
app.get('/auth/:id', routes.auth);
app.post('/viewer', routes.enter_password);
app.get('/timeout', routes.error);
app.post('/notify', routes.notify);
app.get("/login_page", function(req, res){
  res.render("login_page")
});
app.get("/new_user", routes.new_user)
app.post("/create_user", function(req, res){
  routes.create_user(req, res, function(user){
    req.login(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/user_page/' + req.user.username);
    });
  });
});
app.get("/user_page/:username", routes.auto_user_page);
app.post("/user_page", routes.user_page);
//figure out how to use if error

app.post('/login', passport.authenticate('local', {failureRedirect: '/login_page'}), routes.user_page)
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('database',function (data) {
    if(data.fileOpen === true){
      console.log('Document was open, id is:', data.id);
      models.File.findOne({"_id": data.id}, function(err,result){
        if(err){
          console.log(err);
        }else{
          console.log(result);
          // result["createdAt"] = { type: Date, expires: result.duration };
          socket.emit('timer', {duration: (parseInt(result.duration)*1000)});
        }
      });
    }
  });
  socket.on('remove', function(data){
    models.File.findOne({"_id": data.id}, function(err, doc){
      doc.remove();
    })
  })
});
