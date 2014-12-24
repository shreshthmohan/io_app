var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion

// all upcoming events
exports.upcoming = function(req,res) {
  sequelize.query("select Events.id as id, event_name, start_date as start_date_orig, date_format(start_date, '%e %M %Y') start_date, date_format(end_date, '%e %M %Y') end_date, comments, CityId, Cities.city_name as city_name, Cities.id as CityIdC from Events left outer join (select id, city_name from Cities) Cities on Events.CityId = Cities.id where start_date > NOW() order by start_date_orig limit 2", null, {raw: true} )
  // join to find city name
  .success(function(races) {
    console.log(races)
    res.render('events', {
      title: 'Upcoming Events',
      races: races
    })
  })
}

// all events: old and upcoming
exports.all = function(req,res) {
  sequelize.query("select id, event_name, event_url, organiser_name, organiser_url, address_field, location_url, start_date as start_date_orig, date_format(start_date, '%e %M %Y') start_date, date_format(end_date, '%c %M %Y') end_date, comments, CityId from Events order by start_date_orig", null, {raw: true} )
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

// exp 2
exports.exp2 = function(req, res) {
  db.Event.findAll({
    attributes: [
      'id',
      'event_name',
      [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']],
      // There is some issue with sequelize when using fn, it seems values are not directly available,
      // for instance in this case (remember for loop) race.start_date_ed appears empty in jade output, whereas 
      // race.dataValues.start_date_ed show expected data in jade output
    include: [
      db.City, 
      {
        model: db.EventTag,
        include: [db.Tag]
      },
      {
        model: db.EventSubtag,
        include: [db.Subtag]
      }],
    //where: ['start_date > NOW()'],
    raw: true
    //limit: 10
  })
  .success(function(races) {
    res.render('events', {
      title: 'All Upcoming Events and Races',
      races: races
    })
  })
}
                    

