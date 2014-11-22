var express  = require('express');
var connect  = require('connect');
//var city     = require('./routes/city');
//var retailer = require('./routes/retailer');
var race     = require('./routes/user/event');
var routes   = require('./routes/user');
var http     = require('http');
var path     = require('path');
var db       = require('./models');

var app = express();

// www.example.com:8080
// localhost:8080
app.set('port', process.env.port || 8080);

app.set('views', __dirname + '/views/user');

app.set('view engine', 'jade');

app.use(connect.favicon('public/favicon.ico'));

app.use(connect.logger('dev'))

app.use(connect.json())

// Home
app.get('/', routes.index);

// All upcoming events
app.get('/events/upcoming', race.upcoming)

// All events
app.get('/events/all', race.all)

if ('development' === app.get('env')) {
  app.use(connect.errorHandler())
}

db
  .sequelize  // authenticates and connects with mysql
  .sync(/*{ force: true }*/) // force: true drops tables before recreating
  .complete(function(err) {
    if (err) {
      throw err
    } else {
      http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'))
      })
    }
  })
