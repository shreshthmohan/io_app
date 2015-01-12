var express  = require('express');
var connect  = require('connect');

var admin_routes   = require('./routes/admin');
var admin_city     = require('./routes/admin/city');
var admin_retailer = require('./routes/admin/retailer');
var admin_race     = require('./routes/admin/event');

var routes   = require('./routes/user');
var race     = require('./routes/user/event');
var gear     = require('./routes/user/gear');
var user     = require('./routes/user/user')

var http     = require('http');
var path     = require('path');

var db       = require('./models');

var passport = require('passport');

var auth_middleware = require('./auth/middlewares');

var app = express();

var lessMiddleware = require('less-middleware')
var lessMiddlewareOptions = {}
var lessParserOptions = {}
var lessCompilerOptions = {}

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
// TODO Find out how www.example.com will work instead of
// There is a default port (80?)
app.set('port', process.env.port || 8080);

app.set('views', __dirname + '/views');

app.set('view engine', 'jade');

// TODO Change to a better favicon 
app.use(connect.favicon('public/favicon.ico'));

app.use(connect.logger('dev'))

// Used to parse JSON data passed via POST method (as an example)
// Found by experimentation (i.e. by commenting out json and urlencoded
// middleware one by one) that it's not being used right now
app.use(connect.json())

// Used to parse data from body in the form
// firstname=john&lastname=doe&location=montana (?)
// Default form content type is x-www-form-urlencoded, this piece of connect 
// middleware helps parse that kind of form. It is being used at the moment
app.use(connect.urlencoded())

// Used to enable the use of PUT and DELETE, which modern browsers don't support
// Seems to have been deprecated; TODO Use alternative.
// Not being used right now. Will best useful for REST API
app.use(connect.methodOverride())

app.use(connect.cookieParser()) 
app.use(connect.cookieSession({secret: "shreshth", key: "session"})) 
// TODO: is there something to be done here?

//********************************************//
// NOTE: (IMPORTANT) The following 3 function calls must be called in order
// i.e. no mixing with other middleware
require('./auth/passport').init()
app.use(passport.initialize()) // boots up passport and attaches to express instance
app.use(passport.session()) // tells passport we want to use cookies

//********************************************//

//app.use(require('connect-flash')());

/////////////
// Routing //
/////////////

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

////////////////////////
// Admin routes start //
////////////////////////

app.all('/app/admin*', auth_middleware.ensure_admin);

app.get('/app/admin/sign_up', user.sign_up_form);
app.post('/app/admin/sign_up', user.sign_up);

// Admin home
app.get('/app/admin', admin_routes.index);

app.get('/app/admin/error', admin_routes.error);

// Create gear retailer
app.get('/app/admin/gear/create_retailer', admin_retailer.create_form);
app.post('/app/admin/gear/create_retailer', admin_retailer.create);

// List of links to gear retailers by city
app.get('/app/admin/gear', admin_retailer.cities);

// List all retailers in a city
// Whether or not to take care of uppercase, if yes, how?
// it's taken care of by default
app.get('/app/admin/gear/:city_name', admin_city.retailer_list);

// Individual retailer in specified city
app.get('/app/admin/gear/:city_name/:retailer_name', admin_retailer.individual);

// modify gear_retailer
// should ideally be PUT, checking if POST will do the job
// Yes, it will do the 'job', but it won't be true REST API
// TODO make REST
app.post('/app/admin/gear/:city_name/:retailer_name', admin_retailer.modify);
app.post('/app/admin/gear/:city_name/:retailer_name/modify_name', admin_retailer.modify_retailer_name);
app.post('/app/admin/gear/:city_name/:retailer_name/add_brand', admin_retailer.add_brand);
app.post('/app/admin/gear/:city_name/:retailer_name/choose_brand', admin_retailer.choose_brand);
app.post('/app/admin/gear/:city_name/:retailer_name/add_tag', admin_retailer.add_tag);
app.post('/app/admin/gear/:city_name/:retailer_name/choose_tag', admin_retailer.choose_tag);

app.post('/app/admin/gear/:city_name/:retailer_name/add_slink', admin_retailer.add_slink);
app.post('/app/admin/gear/:city_name/:retailer_name/add_phone', admin_retailer.add_phone);
app.post('/app/admin/gear/:city_name/:retailer_name/add_email', admin_retailer.add_email);

// Destroy social link associated with a retailer
app.get('/app/admin/gear/:city_name/:retailer_name/slink/:slink_id', admin_retailer.destroy_slink);

// Destroy phone number associated with a retailer
app.get('/app/admin/gear/:city_name/:retailer_name/number/:number', admin_retailer.destroy_number);

// Destroy email associated with a retailer
app.get('/app/admin/gear/:city_name/:retailer_name/email/:email_id', admin_retailer.destroy_email);

// Dissociate tag associated with a retailer
// It effectively will destroy entry in GearTags table while retaining
// corresponding entry in Tags table
// TODO fix routes, using names is useless. Use id instead.
app.get('/app/admin/gear/:city_name/:retailer_name/tag/:tag_id', admin_retailer.dissociate_tag);
app.get('/app/admin/gear/:city_name/:retailer_name/brand/:brand_id', admin_retailer.dissociate_brand);

app.post('/app/admin/add_tag', admin_routes.add_tag);

app.get('/app/admin/add_tag', admin_routes.new_tag_form);
app.get('/app/admin/tag/:tag_id', admin_routes.individual_tag);
app.post('/app/admin/tag/:tag_id/tag_name', admin_routes.modify_tag_name);
app.post('/app/admin/tag/:tag_id/image_url', admin_routes.modify_tag_image_url);

app.post('/app/admin/add_subtag', admin_routes.add_subtag);

app.get('/app/admin/add_subtag', admin_routes.new_subtag_form);

// Note: subtags are associated only with events at the moment

app.post('/app/admin/add_brand', admin_routes.add_brand);

app.get('/app/admin/add_brand', admin_routes.new_brand_form);

// destroy (?) gear_retailer

// create indian_city
app.post('/app/admin/city/create', admin_city.create);

// destroy city
app.get('/app/admin/city/:city_id/destroy', admin_city.destroy);

// create tag

// List of all cities
app.get('/app/admin/city/index', admin_city.index)

app.get('/app/admin/events/create_new', admin_race.create_form)

// Create new event
app.post('/app/admin/events/create_new', admin_race.create); 

// List of cities as per events
app.get('/app/admin/events', admin_race.cities);

app.get('/app/admin/events/:city_name', admin_city.event_list);

app.get('/app/admin/events/:city_name/:event_name', admin_race.individual);

app.post('/app/admin/events/:city_name/:event_name', admin_race.modify);

app.post('/app/admin/events/:city_name/:event_name/add_tag', admin_race.add_tag);

app.post('/app/admin/events/:city_name/:event_name/choose_tag', admin_race.choose_tag);

app.post('/app/admin/events/:city_name/:event_name/add_subtag', admin_race.add_subtag);

app.post('/app/admin/events/:city_name/:event_name/choose_subtag', admin_race.choose_subtag);

app.post('/app/admin/events/:city_name/:event_name/add_slink', admin_race.add_slink);

app.post('/app/admin/events/:city_name/:event_name/add_phone', admin_race.add_phone);

app.post('/app/admin/events/:city_name/:event_name/add_email', admin_race.add_email);

app.post('/app/admin/events/:city_name/:event_name/modify_start_date', admin_race.modify_start_date);
app.post('/app/admin/events/:city_name/:event_name/modify_end_date', admin_race.modify_end_date);

// Destroy social link associated with an event
app.get('/app/admin/events/:city_name/:event_name/slink/:slink_id', admin_race.destroy_slink);

// Destroy phone number associated with an event
app.get('/app/admin/events/:city_name/:event_name/number/:number', admin_race.destroy_number);

// Destroy email associated with an event
app.get('/app/admin/events/:city_name/:event_name/email/:email_id', admin_race.destroy_email);

// Dissociate tag associated with an event
app.get('/app/admin/events/:city_name/:event_name/tag/:tag_id', admin_race.dissociate_tag);

// Dissociate tag associated with an event
app.get('/app/admin/events/:city_name/:event_name/subtag/:subtag_id', admin_race.dissociate_subtag);

//////////////////////
// Admin routes end //
//////////////////////


app.get('/app/home', routes.index);




//////////////////
// Event routes //
//////////////////

// All upcoming events
app.get('/app/events/upcoming', race.upcoming);

// All events
app.get('/app/events', function(req, res) {res.redirect('/app/events/upcoming')});

// Individual event
app.get('/app/events/:city_name/:event_id', race.individual)
// TODO: better URL
//app.get('/app/events/:city_name/:event_id/:event_slug', race.individual)

// Experimental events group route
app.get('/app/events/grouped', race.events_grouped)

/////////////////
// Gear routes //
/////////////////

app.get('/app/gear', gear.all);

app.get('/app/gear/:city_name/:retailer_id', gear.individual)

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
