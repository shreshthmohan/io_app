var express  = require('express');
var connect  = require('connect');
//var city     = require('./routes/city');
//var retailer = require('./routes/retailer');
var race     = require('./routes/user/event');
var routes   = require('./routes/user');
var user     = require('./routes/user/user')
var http     = require('http');
var path     = require('path');
var db       = require('./models');
var lessMiddleware = require('less-middleware')
var passport = require('passport');
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

app.use(connect.cookieParser()) 
app.use(connect.cookieSession({secret: "shreshth", key: "session"})) 

//********************************************//
// NOTE: (IMPORTANT) The following 3 function calls must be called in order
// i.e. no mixing with other middleware
require('./auth/passport').init()
app.use(passport.initialize()) // boots up passport and attaches to express instance
app.use(passport.session()) // tells passport we want to use cookies

//********************************************//

// Home
app.get('/', routes.index);
//app.get('/exp', routes.index_exp)

app.get('/sign_up', user.sign_up_form);
app.post('/sign_up', user.sign_up);

app.get('/sign_in', user.sign_in_form);
app.post('/sign_in', passport.authenticate(
  'local',
  {
    successRedirect: '/',
    failureRedirect: '/sign_in' }));
    // TODO failureFlash

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
