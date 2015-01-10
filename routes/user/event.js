var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');

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

// location: all; tag: all
var up_all_loc_all_tag = function(req, res, where) {
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
    where: [where],
    // workaround for limit bug in sequelize:
    // where: ['start_date >= NOW() limit 10'],
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
          title_: 'All Upcoming Events and Races',
          races: races,
          cities: cities,
          tags: tags,
          loc: req.param('location'),
          activity: req.param('activity')
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
            title_: 'All Upcoming ' + tag.tag_name + ' events',
            tag: tag, // chosen tag
            event_tags: event_tags,
            tags: tags,
            cities: cities,
            loc: req.param('location'),
            activity: req.param('activity')
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
      [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']],
    where: ["CityId = " + req.param('location') + " and " + where],
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
            title_: 'All Upcoming Events and Races in ' + city.city_name,
            races: races,
            cities: cities,
            tags: tags,
            loc: req.param('location'),
            activity: req.param('activity')
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
              title_: 'Upcoming ' + tag.tag_name + ' events in ' + city.city_name,
              tag: tag,
              event_tags: event_tags,
              tags: tags,
              cities: cities,
              loc: req.param('location'),
              activity: req.param('activity')
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


// Searching all locations and all tags
exports.upcoming = function(req, res) {
  var tag  = req.param('activity');
  var loc  = req.param('location');
  var from = req.param('start_date');
  var to   = req.param('end_date');
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { // All locations and all activities
    if((from == '' || from == null) && (to == '' || to == null)) {
      up_all_loc_all_tag(req, res, "start_date >= NOW() and start_date <= NOW() + interval 3 month")
    }
    else if((from == '' || from == null)) {
      up_all_loc_all_tag(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
    else if((to == '' || to == null)) {
      up_all_loc_all_tag(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + from + "', '%d-%m-%Y') + interval 3 month")
    }
    else {
      up_all_loc_all_tag(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
  }
  else if (loc == 0) { // All locations and a chosen activity
    if((from == '' || from == null) && (to == '' || to == null)) {
      up_all_loc_chosen_tag(req, res, "start_date >= NOW() and start_date <= NOW() + interval 3 month")
    }
    else if((from == '' || from == null)) {
      up_all_loc_chosen_tag(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
    else if((to == '' || to == null)) {
      up_all_loc_chosen_tag(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + from + "', '%d-%m-%Y') + interval 3 month")
    }
    else {
      up_all_loc_chosen_tag(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
  }
  else if (tag == 0) { // All activities for a chosen location
    if((from == '' || from == null) && (to == '' || to == null)) {
      up_chosen_loc_all_tag(req, res, "start_date >= NOW() and start_date <= NOW() + interval 3 month")
    }
    else if((from == '' || from == null)) {
      up_chosen_loc_all_tag(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
    else if((to == '' || to == null)) {
      up_chosen_loc_all_tag(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + from + "', '%d-%m-%Y') + interval 3 month")
    }
    else {
      up_chosen_loc_all_tag(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
  }
  else {
    if((from == '' || from == null) && (to == '' || to == null)) { // Chosen location and chosen activity
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= NOW() + interval 3 month")
    }
    else if((from == '' || from == null)) {
      up_both_loc_tag_chosen(req, res, "start_date >= NOW() and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
    else if((to == '' || to == null)) {
      up_both_loc_tag_chosen(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + from + "', '%d-%m-%Y') + interval 3 month")
    }
    else {
      up_both_loc_tag_chosen(req, res, "start_date >= STR_TO_DATE('" + from + "', '%d-%m-%Y') and start_date <= STR_TO_DATE('" + to + "', '%d-%m-%Y')")
    }
  }
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
      'event_url',
      'organiser_name',
      'organiser_url',
      'location_url',
      'address_field',
      'comments',
      [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'),
       'start_date_f'],
      [Sequelize.fn('date_format', Sequelize.col('end_date'), '%e %M %Y'), 'end_date_f']],
    })
  .success(function(race) {
     res.render('user/individual_event', {
       race: race}) 
  }) 
}

// TODO: past events 

///////////////////////////////////////////////////////
// Experimental stuff                                //
///////////////////////////////////////////////////////

// Events grouped

// All activities in all locations group by activities
// find all tags

//exports.events_grouped = function(req, res) {
//  db.EventTag.count({where: {TagId: 1}})
//  .success(function(tag_count) {
//    console.log(JSON.stringify(tag_count))
//    res.render('user/events_groups', {
//      tag_count: tag_count}
//    )
//  })
//}

exports.events_grouped = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = [] // array to be filled with function calls
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.EventTag.count({where: {TagId: t.id}})
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
    //console.log(JSON.stringify(tags))
    console.log(JSON.stringify(tag_c))
    res.render('user/events_groups', {
      tags: tags_c
    })
  })
}
// Note: in the above function tags array is modified and passed on further
// as tags_c. The original array of objects in no more. Only the modified object exists

// exp: eager loading tags
exports.exp = function(req, res) {
  db.Event.findAll({ include: [ db.City, db.EventTag ]})
  .success(function(races) {
    console.log(races)
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
