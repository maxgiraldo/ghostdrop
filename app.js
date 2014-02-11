
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
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.cookieParser());
app.use(express.session({ secret: 'keyboard cat' }));
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

app.get('/', routes.index);
app.post('/upload', routes.create_doc);
app.get('/success', routes.success);
app.get('/auth/:id', routes.auth);
app.post('/viewer', routes.enter_password);
app.get('/timeout', routes.error);
app.post('/notify', routes.notify);


var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('database',function (data) {
    if(data.fileOpen === true){
      console.log('Document was open, id is:', data.id);

      //{ createdAt: { type: Date, expires: 60*60*24 }}

      models.File.findOne({"_id": data.id}, function(err,result){
        if(err){
          console.log(err);
        }
        else{
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
