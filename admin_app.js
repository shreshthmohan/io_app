var express  = require('express');
var connect  = require('connect');
var city     = require('./routes/admin/city');
var retailer = require('./routes/admin/retailer');
var race     = require('./routes/admin/event');
var routes   = require('./routes/admin');
var http     = require('http');
var path     = require('path');
var db       = require('./models');

var app = express();

// TODO Find out how www.example.com will work instead of
// There is a default port (80?)
app.set('port', process.env.port || 8080);
// ^ www.example.com:8080

app.set('views', __dirname + '/views/admin');

app.set('view engine', 'jade');

// TODO Change to a better favicon 
app.use(connect.favicon('public/favicon.ico'));

// TODO what does "dev" actually mean 
// And where does logging actually show up
app.use(connect.logger('dev'))

// Used to parse JSON data passed via POST method (as an example)
// TODO: is it being used? 
app.use(connect.json())

// Used to parse data from body in the form
// firstname=john&lastname=doe&location=montana
// I think this is not being used as of now
app.use(connect.urlencoded())

// Used to enable the use of PUT and DELETE, which modern browsers don't support
app.use(connect.methodOverride())
// Seems to have been deprecated; TODO Use alternative.
// TODO: USE

// Really good explanation of how 'exports' work at 
// http://blog.liangzan.net/blog/2012/06/04/how-to-use-exports-in-nodejs/
// In short, use exports.name to export multiple objects (?) and refer to it as
// name
// Use module.exports if you have only single object (?) to export and refer
// it as filename of the file in which you wrote module.exports

// POSTs, GETs, DELETEs, PUTs

// Links to all available routes

// Home
app.get('/', routes.index);

// create (gear) retailer  

app.get('/gear/create_retailer', retailer.create_form);

app.post('/gear/create_retailer', retailer.create);

// List of links to gear retailers by city
app.get('/gear', retailer.cities);

// List all retailers in a city
// Whether or not to take care of uppercase, if yes, how?
// it's taken care of by default
app.get('/gear/:city_name', city.retailer_list);

// Individual retailer in specified city
app.get('/gear/:city_name/:retailer_name', retailer.individual);

// modify gear_retailer
// should ideally be PUT, checking if POST will do the job
// Yes, it will do the 'job', but it won't be true REST API
// TODO make REST
app.post('/gear/:city_name/:retailer_name', retailer.modify);

app.post('/gear/:city_name/:retailer_name/add_brand', retailer.add_brand);

app.post('/gear/:city_name/:retailer_name/choose_brand', retailer.choose_brand);

app.post('/gear/:city_name/:retailer_name/add_tag', retailer.add_tag);

app.post('/gear/:city_name/:retailer_name/choose_tag', retailer.choose_tag);

app.post('/gear/:city_name/:retailer_name/add_slink', retailer.add_slink);

app.post('/gear/:city_name/:retailer_name/add_phone', retailer.add_phone);

app.post('/gear/:city_name/:retailer_name/add_email', retailer.add_email);

// Destroy social link associated with a retailer
app.get('/gear/:city_name/:retailer_name/slink/:slink_id', retailer.destroy_slink);

// Destroy phone number associated with a retailer
app.get('/gear/:city_name/:retailer_name/number/:number', retailer.destroy_number);

// Destroy email associated with a retailer
app.get('/gear/:city_name/:retailer_name/email/:email_id', retailer.destroy_email);

// Dissociate tag associated with a retailer
// It effectively will destroy entry in GearTags table while retaining
// corresponding entry in Tags table
app.get('/gear/:city_name/:retailer_name/tag/:tag_id', retailer.dissociate_tag);
app.get('/gear/:city_name/:retailer_name/brand/:brand_id', retailer.dissociate_brand);

app.post('/add_tag', routes.add_tag);

app.get('/add_tag', routes.new_tag_form);

app.post('/add_brand', routes.add_brand);

app.get('/add_brand', routes.new_brand_form);

// destroy (?) gear_retailer

// create indian_city
app.post('/city/create', city.create);

// destroy city
app.get('/city/:city_id/destroy', city.destroy);

// create tag

// List of all cities
app.get('/city/index', city.index)

app.get('/events/create_new', race.create_form)

// Create new event
app.post('/events/create_new', race.create); 

// List of cities as per events
app.get('/events', race.cities);

app.get('/events/:city_name', city.event_list);

app.get('/events/:city_name/:event_name', race.individual);

app.post('/events/:city_name/:event_name', race.modify);

app.post('/events/:city_name/:event_name/add_tag', race.add_tag);

app.post('/events/:city_name/:event_name/choose_tag', race.choose_tag);

app.post('/events/:city_name/:event_name/add_slink', race.add_slink);

app.post('/events/:city_name/:event_name/add_phone', race.add_phone);

app.post('/events/:city_name/:event_name/add_email', race.add_email);

// Destroy social link associated with an event
app.get('/events/:city_name/:event_name/slink/:slink_id', race.destroy_slink);

// Destroy phone number associated with an event
app.get('/events/:city_name/:event_name/number/:number', race.destroy_number);

// Destroy email associated with an event
app.get('/events/:city_name/:event_name/email/:email_id', race.destroy_email);

app.get('/events/:city_name/:event_name/tag/:tag_id', race.dissociate_tag);

// To serve static files
app.use(express.static(path.join(__dirname, 'public')))

// development only
// TODO But where is env being set
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
