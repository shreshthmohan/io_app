var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion

// all upcoming events
exports.upcoming = function(req,res) {
  sequelize.query("select id, event_name, event_url, organiser_name, organiser_url, address_field, location_url, start_date as start_date_orig, date_format(start_date, '%c %M %Y') start_date, date_format(end_date, '%c %M %Y') end_date, comments, CityId from Events where start_date > NOW() order by start_date_orig", null, {raw: true} )
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
