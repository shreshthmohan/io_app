var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var auth = {
  auth: {
    api_key: process.env.MG_API_KEY,
    domain: process.env.MG_DOMAIN
  }
}

var transporter = nodemailer.createTransport(mg(auth));

exports.user_submission = function(req, res) {
  var mail_options = {
    from: 'user@example.com', //TODO
    to: 'sremog@gmail.com',
    subject: 'New event ' + req.param('event_name'),
    text: 'Body: \n Dates: ' + req.param('dates') + '\nLocation: ' + req.param('location') //TODO
  }
  transporter.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log(error);
    }
    else {
      console.log('Message sent: ' + JSON.stringify(info));
    }
  })
}


//16 posibilities
//     location tag start end 
//1.   0        0   0     0   : where start>= NOW and end <=now +3M
//2.   0        0   0     1   : where start>= NOW and end <= ... 
//3.   0        0   1     0   : where start>= ... and end <= ... + 3M 
//4.   0        0   1     1   : where start>= ... and end <= ... 
//5.   0        1   0     0   : different query sequence i.e. first search for the tag by name, then related eventtag, then all the events
//6.   0        1   0     1   : q#5 and where start >= NOW  and  <= ...
//7.   0        1   1     0   : q#5 and where ... and  <= ... + 3M
//8.   0        1   1     1   : q#5 and where ... and  <= ...
//9.   1        0   0     0   : find city, then all associated events
//10.  1        0   0     1   : q#9 and where start >= NOW and <= ...
//11.  1        0   1     0   : q#9 and where start ... and <= ... + 3M 
//12.  1        0   1     1   : q#9 and where start ... and <= ...
//13.  1        1   0     0   : search tag, then eventtags including events where city
//14.  1        1   0     1   : q#13 and where start >= NOW and <= ...
//15.  1        1   1     0   : q#13 and where start ... and <= ... + 3M 
//16.  1        1   1     1   : q#13 and where start ... and <= ...
// that makes 4 kinds of queries for upcoming events

// Default search interval (when user misses out date(s))
var int_dur = "12 month";
var int_dur_cho = "1 month";

// New logic for searching by date:
// Only 1 input date to be input by users, making it easier for them.
// If when is chosen +/- 3 int_dur
// handle the case where when - start_date < int_dur
// range now to when +/- 1 month

// Searching all locations and all tags
exports.upcoming = function(req, res) {
  var tag  = req.param('activity');
  var loc  = req.param('location');
  var when   = req.param('date');
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { // All locations and all activities
    if((when == '' || when == null)) {
      up_all_loc_all_tag(req, res, "start_date >= NOW() and start_date <= NOW() + interval " + int_dur)
    }
    else {
      up_all_loc_all_tag(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + when + "', '%d-%m-%Y') + interval " + int_dur_cho + " and start_date >= STR_TO_DATE('" + when + "', '%d-%m-%Y') - interval " + int_dur_cho)
    }
  }
  else if (loc == 0) { // All locations and a chosen activity
    if((when == '' || when == null)) {
      up_all_loc_chosen_tag(req, res, "start_date >= NOW() and start_date <= NOW() + interval " + int_dur)
    }
    else {
      up_all_loc_chosen_tag(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + when + "', '%d-%m-%Y') + interval " + int_dur_cho + " and start_date >= STR_TO_DATE('" + when + "', '%d-%m-%Y') - interval " + int_dur_cho)
    }
  }
  else if (tag == 0) { // All activities for a chosen location
    if((when == '' || when == null)) {
      up_chosen_loc_all_tag(req, res, "start_date >= NOW() and start_date <= NOW() + interval " + int_dur)
    }
    else {
      up_chosen_loc_all_tag(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + when + "', '%d-%m-%Y') + interval " + int_dur_cho + " and start_date >= STR_TO_DATE('" + when + "', '%d-%m-%Y') - interval " + int_dur_cho)
    }
  }
  else {
    if((when == '' || when == null)) {
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= NOW() + interval " + int_dur)
    }
    else {
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + when + "', '%d-%m-%Y') + interval " + int_dur)
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + when + "', '%d-%m-%Y') + interval " + int_dur_cho + " and start_date >= STR_TO_DATE('" + when + "', '%d-%m-%Y') - interval " + int_dur_cho)
    }
  }
}

// location: all; tag: all
var up_all_loc_all_tag = function(req, res, where) {
  db.Event.findAll({
    attributes: [
      'id',
      'event_name',
      'event_name_slug',
      'img_url_square',
      'start_date',
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
    where: [where],
    // workaround for limit bug in sequelize:
    // where: ['start_date >= NOW() limit 10'],
    order: 'start_date ASC',
    raw: true
    //limit: 10
    // There's also a bug in sequelize related to limit
  })
  .success(function(races) {
    db.City.findAll()
    .success(function(cities) {
      db.Tag.findAll()
      .success(function(tags) {
        res.render('user/events', {
          active_tab: 'events',
          title_: 'All Upcoming Events and Races',
          races: races,
          cities: cities,
          tags: tags,
          mode: 'all_tag_all_loc',
          loc: req.param('location'),
          activity: req.param('activity'),
          date: req.param('date')
        })
      })
    })
  })
}

// location: all; tag: [chosen]
up_all_loc_chosen_tag = function(req, res, where) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.EventTag.findAll({
      where: ['TagId = ' + tag.id],
      order: 'start_date ASC',
      include: [
        {
         model: db.Event,
         where: [where],
         include: [
           db.City,
           {
            model: db.EventSubtag,
            include: [db.Subtag]}],
         attributes: [
           'id',
           'event_name',
           'event_name_slug',
           'img_url_square',
           [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']],
        }
      ],
      raw: true
    })
    .success(function(event_tags) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/events', {
            active_tab: 'events',
            title_: 'All Upcoming ' + tag.tag_name + ' events',
            tag: tag, // chosen tag
            event_tags: event_tags,
            tags: tags,
            cities: cities,
            mode: 'cho_tag_all_loc',
            loc: req.param('location'),
            activity: req.param('activity'),
            date: req.param('date')
          })
        })
      })
    })
  })
}

// Location: [chosen]; tag: All
up_chosen_loc_all_tag = function(req, res, where) {
  db.Event.findAll({
    attributes: [
      'id',
      'event_name',
      'event_name_slug',
      'img_url_square',
      'start_date',
      [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']],
    where: ["CityId = " + req.param('location') + " and " + where],
    order: 'start_date ASC',
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
    raw: true
  })
  .success(function(races) {
    db.City.find({where: {id: req.param('location')}})
    .success(function(city) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/events', {
            active_tab: 'events',
            title_: 'All Upcoming Events and Races in ' + city.city_name,
            races: races,
            cities: cities,
            tags: tags,
            city: city,
            mode: 'all_tag_cho_loc',
            loc: req.param('location'),
            activity: req.param('activity'),
            date: req.param('date')
          })
        })
      })
    })
  })
}

// Both location and tag are chosen
up_both_loc_tag_chosen = function(req, res, where) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.EventTag.findAll({
      where: ['TagId = ' + tag.id],
      order: 'start_date ASC',
      include: [
        {
         model: db.Event,
         where: ["CityId = " + req.param('location') + " and " + where],
         include: [
           db.City, 
           {
            model: db.EventSubtag,
            include: [db.Subtag]}],
         attributes: [
           'id',
           'event_name',
           'event_name_slug',
           'img_url_square',
           [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']],
        }
      ],
      raw: true
    })
    .success(function(event_tags) {
      db.City.find({where: {id: req.param('location')}})
      .success(function(city) {
        db.City.findAll()
        .success(function(cities) {
          db.Tag.findAll()
          .success(function(tags) {
            res.render('user/events', {
              active_tab: 'events',
              title_: 'Upcoming ' + tag.tag_name + ' events in ' + city.city_name,
              tag: tag,
              event_tags: event_tags,
              tags: tags,
              cities: cities,
              city: city,
              mode: 'cho_tag_cho_loc',
              loc: req.param('location'),
              activity: req.param('activity'),
              date: req.param('date')
            })
          })
        })
      })
    })
  })
}

//Note: the 4 (location, tag) possiblities consist of two pairs.
//i.e. we have used just two views to take care of 4 (location, tag)
//possiblities

/////////////////////////////////////////////////////////////////////////
// Events grouped by either by activity or location (dates diregarded) //
/////////////////////////////////////////////////////////////////////////

exports.upcoming_grouped = function(req, res) {
  var tag  = req.param('activity');
  var loc  = req.param('location');
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { // All locations and all activities
    grouped(req, res) 
  }
  else if (loc == 0 || loc == null) { // All locations and a chosen activity
    grouped_by_location_chosen_tag(req, res)
  }
  else if (tag == 0 || tag == null) { // All activities for a chosen location
    grouped_by_activity_chosen_loc(req, res)
  }
  else {
    if((from == '' || from == null) && (to == '' || to == null)) { // Chosen location and chosen activity
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= NOW() + interval " + int_dur)
    }
    else if((from == '' || from == null)) {
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
    else if((to == '' || to == null)) {
      up_both_loc_tag_chosen(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + from + "', '%d-%m-%Y') + interval " + int_dur)
    }
    else {
      up_both_loc_tag_chosen(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
  }
}

// Events grouped
// All activities, all locations: events grouped by activity
// All locations, chosen activity: events grouped by locations
// All activites, chosen location: events grouped by activity
// Chosen location, chosen activity: events not to be grouped


// find all tags


// Will land up here when people search for all locations with all tags
// All activities, all locations: events grouped by activity
// List of tags with number of events associated with each tag
var grouped = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = [] // array to be filled with function calls
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.EventTag.count({
          where: {TagId: t.id},
          include: [{
            model: db.Event,
            where: ['start_date > NOW()']
          }]
          })
        .then(function(event_count) {
          tag = t.toJSON();
          tag.event_count = event_count;
          return tag
        })
      )
    })
    return Promise.all(promises);
  })
  .then(function(tags_c) {
    db.City.findAll()
    .then(function(cities) {
      var promises = []
      var city
      cities.forEach(function(c) {
        promises.push(
          db.Event.count({
            where: Sequelize.and(
              {CityId: c.id},
              {start_date: {gte: new Date()}})
          })
          .then(function(event_count) {
            city = c.toJSON();
            city.event_count = event_count;
            return city;
          })
        )
      })
      return Promise.all(promises)
    })
    .success(function(cities_c) {
      res.render('user/event_groups', {
        active_tab: 'events',
        title_: 'Upcoming outdoor and adventure events all over India',
        tags: tags_c, //tags with counts of respective events
        cities: cities_c,
        group_mode: 'all_tag_all_loc',
        activity: req.param('activity'),
        loc: req.param('location')
      })
    })
  })
}
// Note: in the above function tags array is modified and passed on further
// as tags_c. The original array of objects in no more. Only the modified object exists

// All activities, chosen locations
var grouped_by_activity_chosen_loc = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = [] // array to be filled with function calls
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.Event.count({
            include: [{
                model: db.EventTag,
                where: {TagId: t.id}
            }],
            where: Sequelize.and(
              {CityId: req.param('location')},
              {start_date: {gte: new Date()}})
        })
        .then(function(event_count) {
          tag = t.toJSON();
          tag.event_count = event_count;
          return tag
        })
      )
    })
    return Promise.all(promises);
  })
  .then(function(tags_c) {
    db.City.findOne({where: {id: req.param('location')}})
    .then(function(city) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/event_groups', {
            active_tab: 'events',
            title_: 'All upcoming outdoor and adventure events in ' + city.city_name,
            tags: tags_c, //tags with counts of respective events
            group_mode: 'all_tag_cho_loc',
            city: city,
            cities: cities,
            activity: req.param('activity'),
            loc: req.param('location')
          })
        })
      })
    })
  })
}

// Chosen activity, all locations, group by location
var grouped_by_location_chosen_tag = function(req, res) {
  db.City.findAll()
  .then(function(cities) {
    var promises = []
    var city
    cities.forEach(function(c) {
      promises.push(
        db.Event.count({
          where: Sequelize.and(
            {CityId: c.id},
            {start_date: {gt: new Date()}}),
          include: [{
              model: db.EventTag,
              where: {TagId: req.param('activity')}}]
        })
        .then(function(event_count) {
          city = c.toJSON();
          city.event_count = event_count;
          return city
        })
      )
    })
    return Promise.all(promises)
  })
  .then(function(cities_c) {
    db.Tag.findOne({where: {id: req.param('activity')}})
    .then(function(tag) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/event_groups', {
            active_tab: 'events',
            title_: 'Upcoming ' + tag.tag_name + ' events all over India',
            group_mode: 'cho_tag_all_loc',
            cities: cities_c,
            tag: tag,
            tags: tags,
            activity: req.param('activity'),
            loc: req.param('location')
          })
        })
      })
    })
  })
}

// Individual events
exports.individual = function(req, res) {
  db.Event.find({
    where: {id: req.param('event_id')},
    include: [ 
      db.City,
      db.Email,
      db.SocialLink,
      db.PhoneNumber,
      {
        model: db.EventTag,
        include: [db.Tag]},
      {
        model: db.EventSubtag,
        include: [db.Subtag]}
      ],
    attributes: [
      'id',
      'event_name',
      'event_name_slug',
      'img_url_square',
      'event_url',
      'organiser_name',
      'organiser_url',
      'location_url',
      'address_field',
      'comments',
      [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'),
       'start_date_f'],
      [Sequelize.fn('date_format', Sequelize.col('end_date'), '%e %M %Y'), 'end_date_f']]
    })
  .success(function(race) {
     res.render('user/individual_event', {
       active_tab: 'events',
       title_: race.event_name + ' in ' + race.City.city_name,
       race: race}) 
  }) 
}

// TODO: past events 



///////////////////////////////////////////////////////
// Experimental stuff                                //
///////////////////////////////////////////////////////

// exp: eager loading tags
exports.exp = function(req, res) {
  db.Event.findAll({ include: [ db.City, db.EventTag ]})
  .success(function(races) {
    res.render('user/events_exp', {
      races: races 
    })
  })
}

// events if location: All, tag: All and no dates are input
// make date-range default: today - today + 3 months
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
    where: ['start_date >= NOW()'],
    // workaround for limit bug in sequelize:
    // where: ['start_date >= NOW() limit 10'],
    raw: true
    //limit: 10
    // There's also a bug in sequelize related to limit
  })
  .success(function(races) {
    res.render('user/events', {
      title: 'All Upcoming Events and Races',
      races: races
    })
  })
}
                    
exports.exp_event_search = function(req, res) {
  if (req.param('start_date') == '') {
    var from = "null";
  }
  res.render('user/exp_event_search', {
    activity: req.param('activity'),
    loc: req.param('location'),
    start_date: from, 
    end_date: req.param('end_date')
  })
}

// all events: old and upcoming
exports.all = function(req,res) {
  sequelize.query("select id, event_name, event_url, organiser_name, organiser_url, address_field, location_url, start_date as start_date_orig, date_format(start_date, '%e %M %Y') start_date, date_format(end_date, '%c %M %Y') end_date, comments, CityId from Events order by start_date_orig", null, {raw: true} )
  .success(function(races) {
    res.render('user/events', {
      title: 'All Events',
      races: races
    })
  })
}

// for refering to raw MySQL queries
/*
// all upcoming events
exports.upcoming = function(req,res) {
  sequelize.query("select Events.id as id, event_name, start_date as start_date_orig, date_format(start_date, '%e %M %Y') start_date, date_format(end_date, '%e %M %Y') end_date, comments, CityId, Cities.city_name as city_name, Cities.id as CityIdC from Events left outer join (select id, city_name from Cities) Cities on Events.CityId = Cities.id where start_date >= NOW() order by start_date_orig limit 2", null, {raw: true} )
  // join to find city name
  .success(function(races) {
    console.log(races)
    res.render('user/events', {
      title: 'Upcoming Events',
      races: races
    })
  })
}
*/
