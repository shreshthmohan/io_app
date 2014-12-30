var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion



//
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
//
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
    res.render('events_new', {
      title: 'All Upcoming Events and Races',
      races: races
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
      console.log(JSON.stringify(event_tags))
      res.render('events_chosen_tag_new', {
        tag: tag,
        event_tags: event_tags
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
    console.log(JSON.stringify(races))
    res.render('events_new', {
      title: 'All Upcoming Events and Races',
      races: races
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
      res.render('events_chosen_tag_new', {
        tag: tag,
        event_tags: event_tags
      })
    })
  })
}

//Note: the 4 (location, tag) possiblities consist of two pairs.
//i.e. we have used just two views to take care of 4 (location, tag)
//possiblities

// Searching all locations and all tags
exports.upcoming = function(req, res) {
  console.log("upcoming called")
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
  else if (loc == 0) { // All locations and a chose activity
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

// TODO: past events 

///////////////////////////////////////////////////////
// Experimental stuff                                //
///////////////////////////////////////////////////////
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
    res.render('events', {
      title: 'All Upcoming Events and Races',
      races: races
    })
  })
}
                    
exports.exp_event_search = function(req, res) {
  if (req.param('start_date') == '') {
    var from = "null";
  }
  res.render('exp_event_search', {
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
    res.render('events', {
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
    res.render('events', {
      title: 'Upcoming Events',
      races: races
    })
  })
}
*/
