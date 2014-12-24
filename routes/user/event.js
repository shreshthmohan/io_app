var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion

// all upcoming events
exports.upcoming = function(req,res) {
  sequelize.query("select Events.id as id, event_name, start_date as start_date_orig, date_format(start_date, '%d %M %Y') start_date, date_format(end_date, '%d %M %Y') end_date, comments, CityId, Cities.city_name as city_name, Cities.id as CityIdC from Events left outer join (select id, city_name from Cities) Cities on Events.CityId = Cities.id where start_date > NOW() order by start_date_orig", null, {raw: true} )
  // join to find city name
  .success(function(races) {
    res.render('events', {
      title: 'Upcoming Events',
      races: races
    })
  })
}

// all events: old and upcoming
exports.all = function(req,res) {
  sequelize.query("select id, event_name, event_url, organiser_name, organiser_url, address_field, location_url, start_date as start_date_orig, date_format(start_date, '%c %M %Y') start_date, date_format(end_date, '%c %M %Y') end_date, comments, CityId from Events order by start_date_orig", null, {raw: true} )
  .success(function(races) {
    res.render('events', {
      title: 'All Events',
      races: races
    })
  })
}

// exp: eager loading tags
exports.exp = function(req, res) {
  db.Event.findAll({ include: [ db.City, db.EventTag ]})
  .success(function(races) {
    console.log(races)
    res.render('events_exp', {
      races: races 
    })
  })
}
