var express  = require('express');
var connect  = require('connect');
//var city     = require('./routes/city');
//var retailer = require('./routes/retailer');
var race     = require('./routes/user/event');
var routes   = require('./routes/user');
var http     = require('http');
var path     = require('path');
var db       = require('./models');
var lessMiddleware = require('less-middleware')
var lessMiddlewareOptions = {}
var lessParserOptions = {}
var lessCompilerOptions = {}

var app = express();

app.use(lessMiddleware(
  __dirname + '/stylesheets' 
  // middleware looks for less files here
  ,lessMiddlewareOptions = {
    dest: __dirname + '/public',
    relativeUrls: true, // what does this exactly mean
    force: app.get('env') === 'development',
    once: app.get('env') !== 'development', // generate once if not dev
    debug: app.get('env') === 'development'
  }
  ,lessParserOptions = {
    dumpLineNumbers: 'comments'
    // mediaquery/comments
    // introduces mediaquery/comments in generated css
  }
  ,lessCompilerOptions = {
    compress: app.get('env') !== 'development'
    // Don't compress in development
    // Note: If compress: true, then dumpLineNumbers will be ignored
  }))

// www.example.com:8080
// localhost:8080
app.set('port', process.env.port || 8080);

app.set('views', __dirname + '/views/user');

app.set('view engine', 'jade');

app.use(connect.favicon('public/favicon.ico'));

app.use(connect.logger('dev'))

app.use(connect.json())

app.use(connect.urlencoded())

app.use(connect.methodOverride())

// Home
app.get('/', routes.index);
//app.get('/exp', routes.index_exp)

// All upcoming events
app.get('/events/upcoming', race.upcoming)

// All events
app.get('/events', race.all)


// Exp
app.get('/exp', race.exp);

app.get('/exp2', race.exp2);
app.get('/exp_event_search', race.exp_event_search);

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))

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
