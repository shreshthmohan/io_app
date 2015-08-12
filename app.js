var express  = require('express');
var connect  = require('connect');

var admin_routes   = require('./routes/admin');
var admin_city     = require('./routes/admin/city');
var admin_retailer = require('./routes/admin/retailer');
var admin_race     = require('./routes/admin/event');
var admin_group    = require('./routes/admin/group');
var admin_school   = require('./routes/admin/school');

var routes   = require('./routes/user');
var race     = require('./routes/user/event');
var gear     = require('./routes/user/gear');
var group    = require('./routes/user/group');
var school   = require('./routes/user/school');
var user     = require('./routes/user/user')
var activity = require('./routes/user/activity')

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

// To change env
//app.settings.env = 'production';

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

if (app.get('env') === 'development') {
  app.locals.pretty = true;
}
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
//app.get('/', function(req, res) {res.redirect('/app/home')})
app.get('/', routes.index);
//app.get('/alt', routes.index_alt);

// Checking if user is authenticated for every route except sign-in/up
app.all('/app/admin*', auth_middleware.ensure_auth);
// Adding a boolean 'admin' to res.locals
app.all('/*', auth_middleware.add_admin_bool);

////////////////////////
// Admin routes start //
////////////////////////

// Checking if user has admin privileges
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
app.get('/app/admin/gear/city/:city_id', admin_city.retailer_list);

// Individual retailer in specified city
app.get('/app/admin/gear/retailer/:retailer_id', admin_retailer.individual);

// modify gear_retailer
// should ideally be PUT, checking if POST will do the job
// Yes, it will do the 'job', but it won't be true REST API
// TODO make REST
app.post('/app/admin/gear/retailer/:retailer_id', admin_retailer.modify);
app.post('/app/admin/gear/retailer/:retailer_id/modify_name', admin_retailer.modify_name);
app.post('/app/admin/gear/retailer/:retailer_id/modify_city', admin_retailer.modify_city);
app.post('/app/admin/gear/retailer/:retailer_id/add_brand', admin_retailer.add_brand);
app.post('/app/admin/gear/retailer/:retailer_id/choose_brand', admin_retailer.choose_brand);
app.post('/app/admin/gear/retailer/:retailer_id/add_tag', admin_retailer.add_tag);
app.post('/app/admin/gear/retailer/:retailer_id/choose_tag', admin_retailer.choose_tag);

app.post('/app/admin/gear/retailer/:retailer_id/add_slink', admin_retailer.add_slink);
app.post('/app/admin/gear/retailer/:retailer_id/add_phone', admin_retailer.add_phone);
app.post('/app/admin/gear/retailer/:retailer_id/add_email', admin_retailer.add_email);

// Destroy social link associated with a retailer
app.get('/app/admin/gear/:retailer_id/destroy_slink/:slink_id', admin_retailer.destroy_slink);

// Destroy phone number associated with a retailer
app.get('/app/admin/gear/:retailer_id/destroy_number/:number', admin_retailer.destroy_number);

// Destroy email associated with a retailer
app.get('/app/admin/gear/:retailer_id/destroy_email/:email_id', admin_retailer.destroy_email);

// Dissociate tag associated with a retailer
// It effectively will destroy entry in GearTags table while retaining
// corresponding entry in Tags table
// TODO fix routes, using names is useless. Use id instead.
app.get('/app/admin/gear/:retailer_id/dissociate_tag/:tag_id', admin_retailer.dissociate_tag);
app.get('/app/admin/gear/:retailer_id/dissociate_brand/:brand_id', admin_retailer.dissociate_brand);

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
app.post('/app/admin/city_create', admin_city.create);

app.get('/app/admin/city/:city_id', admin_city.individual)
app.post('/app/admin/city/:city_id/modify_name', admin_city.modify_name)
app.post('/app/admin/city/:city_id/modify_image_url', admin_city.modify_image_url)

// destroy city
app.get('/app/admin/city/:city_id/destroy', admin_city.destroy);

// create tag

// List of all cities
app.get('/app/admin/city_index', admin_city.index)

app.get('/app/admin/events/create_new', admin_race.create_form)

// Create new event
app.post('/app/admin/events/create_new', admin_race.create); 

// List of cities as per events
app.get('/app/admin/events', admin_race.cities);

app.get('/app/admin/events/city/:city_id', admin_city.event_list);
// TODO fix

app.get('/app/admin/events/:event_id', admin_race.individual);

app.post('/app/admin/events/:event_id/modify_name', admin_race.modify_name);

app.post('/app/admin/events/:event_id/modify_city', admin_race.modify_city);

app.post('/app/admin/events/:event_id', admin_race.modify);

app.post('/app/admin/events/:event_id/add_tag', admin_race.add_tag);

app.post('/app/admin/events/:event_id/choose_tag', admin_race.choose_tag);

app.post('/app/admin/events/:event_id/add_subtag', admin_race.add_subtag);

app.post('/app/admin/events/:event_id/choose_subtag', admin_race.choose_subtag);

app.post('/app/admin/events/:event_id/add_slink', admin_race.add_slink);

app.post('/app/admin/events/:event_id/add_phone', admin_race.add_phone);

app.post('/app/admin/events/:event_id/add_email', admin_race.add_email);

app.post('/app/admin/events/:event_id/modify_start_date', admin_race.modify_start_date);
app.post('/app/admin/events/:event_id/modify_end_date', admin_race.modify_end_date);

// Destroy social link associated with an event
app.get('/app/admin/events/:event_id/destroy_slink/:slink_id', admin_race.destroy_slink);

// Destroy phone number associated with an event
app.get('/app/admin/events/:event_id/destroy_number/:number', admin_race.destroy_number);

// Destroy email associated with an event
app.get('/app/admin/events/:event_id/destroy_email/:email_id', admin_race.destroy_email);

// Dissociate tag associated with an event
app.get('/app/admin/events/:event_id/dissociate_tag/:tag_id', admin_race.dissociate_tag);

// Dissociate subtag associated with an event
app.get('/app/admin/events/:event_id/dissociate_subtag/:subtag_id', admin_race.dissociate_subtag);

// Group routes
// Create group
app.get('/app/admin/groups/create_group', admin_group.create_form);
app.post('/app/admin/groups/create_group', admin_group.create);

// List of links to groups by city
app.get('/app/admin/groups', admin_group.cities);

// List all groups in a city
// Whether or not to take care of uppercase, if yes, how?
// it's taken care of by default
app.get('/app/admin/groups/city/:city_id', admin_city.group_list);

// Individual group in specified city
app.get('/app/admin/groups/:group_id', admin_group.individual);

// modify gear_group
// should ideally be PUT, checking if POST will do the job
// Yes, it will do the 'job', but it won't be true REST API
// TODO make REST
app.post('/app/admin/groups/:group_id', admin_group.modify);
app.post('/app/admin/groups/:group_id/modify_name', admin_group.modify_name);
app.post('/app/admin/groups/:group_id/modify_city', admin_group.modify_city);
app.post('/app/admin/groups/:group_id/add_tag', admin_group.add_tag);
app.post('/app/admin/groups/:group_id/choose_tag', admin_group.choose_tag);

app.post('/app/admin/groups/:group_id/add_slink', admin_group.add_slink);
app.post('/app/admin/groups/:group_id/add_phone', admin_group.add_phone);
app.post('/app/admin/groups/:group_id/add_email', admin_group.add_email);

// Destroy social link associated with a group
app.get('/app/admin/groups/:group_id/destroy_slink/:slink_id', admin_group.destroy_slink);

// Destroy phone number associated with a group
app.get('/app/admin/groups/:group_id/destroy_number/:number', admin_group.destroy_number);

// Destroy email associated with a group
app.get('/app/admin/groups/:group_id/destroy_email/:email_id', admin_group.destroy_email);

// Dissociate tag associated with a group
// It effectively will destroy entry in GearTags table while retaining
// corresponding entry in Tags table
// TODO fix routes, using names is useless. Use id instead.
app.get('/app/admin/groups/:group_id/dissociate_tag/:tag_id', admin_group.dissociate_tag);


// School routes
// Create school
app.get('/app/admin/schools/create_school', admin_school.create_form);
app.post('/app/admin/schools/create_school', admin_school.create);

// List of links to schools by city
app.get('/app/admin/schools', admin_school.cities);

// List all schools in a city
// Whether or not to take care of uppercase, if yes, how?
// it's taken care of by default
app.get('/app/admin/schools/city/:city_id', admin_city.school_list);

// Individual school in specified city
app.get('/app/admin/schools/:school_id', admin_school.individual);

// modify gear_school
// should ideally be PUT, checking if POST will do the job
// Yes, it will do the 'job', but it won't be true REST API
// TODO make REST
app.post('/app/admin/schools/:school_id', admin_school.modify);
app.post('/app/admin/schools/:school_id/modify_name', admin_school.modify_name);
app.post('/app/admin/schools/:school_id/modify_city', admin_school.modify_city);
app.post('/app/admin/schools/:school_id/add_tag', admin_school.add_tag);
app.post('/app/admin/schools/:school_id/choose_tag', admin_school.choose_tag);

app.post('/app/admin/schools/:school_id/add_slink', admin_school.add_slink);
app.post('/app/admin/schools/:school_id/add_phone', admin_school.add_phone);
app.post('/app/admin/schools/:school_id/add_email', admin_school.add_email);

// Destroy social link associated with a school
app.get('/app/admin/schools/:school_id/destroy_slink/:slink_id', admin_school.destroy_slink);

// Destroy phone number associated with a school
app.get('/app/admin/schools/:school_id/destroy_number/:number', admin_school.destroy_number);

// Destroy email associated with a school
app.get('/app/admin/schools/:school_id/destroy_email/:email_id', admin_school.destroy_email);

// Dissociate tag associated with a school
// It effectively will destroy entry in GearTags table while retaining
// corresponding entry in Tags table
// TODO fix routes, using names is useless. Use id instead.
app.get('/app/admin/schools/:school_id/dissociate_tag/:tag_id', admin_school.dissociate_tag);

//////////////////////
// Admin routes end //
//////////////////////

//app.get('/app/home', routes.index);

app.get('/about',
  function(req, res) {
    res.render('user/about', {
      title_: 'About'
    }  
)});

//////////////////
// Event routes //
//////////////////

// All upcoming events
app.get('/events/upcoming', race.upcoming); // from home search bar
app.get('/events/upcoming/grouped', race.upcoming_grouped); // from home explore
app.post('/events/user_submission', race.user_submission);
app.post('/events/user_error', race.user_error);
app.post('/events/user_info', race.user_info);
//app.post('/events/event_form', race.new_event); //TODO should add new event directly to the db
app.get('/events/event_form', race.event_form);

// All events
app.get('/events', function(req, res) {res.redirect('/events/upcoming')});
// TODO: better URLs: /events/upcoming/running/bengaluru/1/2

// Individual event
app.get('/events/:city_name_slug/:event_name_slug/:event_id', race.check)
//app.get('/events_test/:city_name_slug/:event_name_slug/:event_id', race.individual_test)
// TODO: works fine even if someone tries to access /events/:some-text/:some-random-text/:event_id
// Need to figure out how to display correct name in URL bar. Some kind of redirection
// Yes, redirection. Find out how much more resources this will use

/////////////////
// Gear routes //
/////////////////

app.get('/gear', gear.all);
app.get('/gear/grouped', gear.all_grouped);
app.post('/gear/user_submission', gear.user_submission);
app.post('/gear/user_error', gear.user_error);
app.post('/gear/user_info', gear.user_info);
app.get('/gear/retailer_form', gear.retailer_form);

app.get('/gear/:city_name_slug/:retailer_name_slug/:retailer_id', gear.check)

//////////////////
// Group routes //
//////////////////

app.get('/groups', group.all);
app.get('/groups/grouped', group.all_grouped);
app.post('/groups/user_submission', group.user_submission);
app.post('/groups/user_error', group.user_error);
app.post('/groups/user_info', group.user_info);
app.get('/groups/group_form', group.group_form);

app.get('/groups/:city_name_slug/:group_name_slug/:group_id', group.check)

///////////////////
// School routes //
///////////////////

app.get('/schools', school.all);
app.get('/schools/grouped', school.all_grouped);
app.post('/schools/user_submission', school.user_submission);
app.post('/schools/user_error', school.user_error);
app.post('/schools/user_info', school.user_info);
app.get('/schools/school_form', school.school_form);

app.get('/schools/:city_name_slug/:school_name_slug/:school_id', school.check)

// Activity routes
app.get('/activity/:tag_id', activity.redir);
app.get('/activity/:tag_id/:tag_name_slug', activity.check);

// Help climbers: static page
app.get('/help_climbers',
  function(req, res) {
    res.render('user/help_climbers', {
      title_: 'Help these climbers get to an International competition'
    }  
)});

// Serving static files
app.use(express.static(path.join(__dirname, 'public')))


// Everytime some user tries to access a page that does not exist
// an error object will be passed to next
app.get('*', function(req, res, next) {
  var err = new Error();
  err.status = 404;
  next(err);
});

// https://blog.safaribooksonline.com/2014/03/12/error-handling-express-js-applications/
// The function defined below is an error middleware. "Error middleware is differentiated from regular middleware/routes by their characteristic four argument functions: err, req, res and next."
app.use(function(err, req, res, next) {
  if(err.status !== 404) {
    return next();
  }
  
  res.status(404).render('user/404', {title_: 'Page not found'});
})




/////////////////////
// User Routes end // 
/////////////////////


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
