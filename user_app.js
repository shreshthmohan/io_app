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
var auth_middleware = require('./auth/middlewares');
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

//app.use(require('connect-flash')());


app.get('/app/admin/sign_up', user.sign_up_form);
app.post('/app/admin/sign_up', user.sign_up);

// Sign-in routing
app.get('/sign_in', user.sign_in_form);
app.post('/sign_in', passport.authenticate(
  'local',
  {
    successRedirect: '/',
    failureRedirect: '/sign_in' }));
    // TODO failureFlash

// Log-out route
app.get('/log_out', user.log_out);

// Redirect users from root to home
app.get('/', function(req, res) {res.redirect('/app/home')})

// Checking if user is authenticated for every route except sign-in/up
app.all('/app/*', auth_middleware.ensure_auth);

app.all('/app/admin*', auth_middleware.ensure_admin);
app.get('/app/admin', routes.admin);

app.get('/app/home', routes.index);

////////////////////////////////
// Events' routes
////////////////////////////////

// All upcoming events
app.get('/app/events/upcoming', race.upcoming)

// All events
app.get('/app/events', race.all)

// Individual event
app.get('/app/events/:city_name/:city_id/:event_id', race.individual)

// Exp
//app.get('/exp', race.exp);
//app.get('/exp2', race.exp2);
//app.get('/exp_event_search', race.exp_event_search);

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
