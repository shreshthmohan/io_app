var express  = require('express');
var connect  = require('connect');
var city     = require('./routes/city');
var retailer = require('./routes/retailer');
var routes   = require('./routes');
var http     = require('http');
var path     = require('path');
var db       = require('./models');

var app = express();

// TODO Find out how www.example.com will work instead of
// There is a default port (80?)
app.set('port', process.env.port || 8080);
// ^ www.example.com:8080

app.set('views', __dirname + '/views');

app.set('view engine', 'jade');

// TODO Change to a better favicon 
app.use(connect.favicon('public/favicon.ico'));

// TODO what does "dev" actually mean 
// And where does logging actually show up
app.use(connect.logger('dev'))

// Used to parse JSON data passed via POST method (as an example)
app.use(connect.json())

// Used to parse data from body in the form
// firstname=john&lastname=doe&location=montana
app.use(connect.urlencoded())

// Used to enable the use of PUT and DELETE, which modern browsers don't support
app.use(connect.methodOverride())

// Really good explanation of how 'exports' work at 
// http://blog.liangzan.net/blog/2012/06/04/how-to-use-exports-in-nodejs/
// In short, use exports.name to export multiple objects (?) and refer to it as
// name
// Use module.exports if you have only single object (?) to export and refer
// it as filename of the file in which you wrote module.exports

// POSTs, GETs, DELETEs, PUTs

// Links to all available routes

app.get('/', routes.index);

// create (gear) retailer  

app.get('/gear/create_retailer', retailer.index);

app.post('/gear/create_retailer', retailer.create);

// List all retailers in a city
// Whether or not to take care of uppercase, if yes, how?
// it's taken care of by default
app.get('/gear/:city_name', city.retailer_list);

// Individual retailer in specified city
app.get('/gear/:city_name/:retailer_name', city.retailer);

// modify gear_retailer

// destroy (?) gear_retailer

// create indian_city
app.post('/city/create', city.create);

// destroy city
app.get('/city/:city_name/destroy', city.destroy);

// create tag

// List of all cities
app.get('/city/index', city.index);

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
