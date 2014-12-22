var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion

// Create form (GET)
exports.create_form = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('create_event', {
      title: 'Create new event',
      cities: cities
    })
  });
}

// Create new event (POST)
exports.create = function(req, res) {
  db.City.find({ where: {id: req.param('city_id')}})
  .success(function(city) {
    db.Event.create({
      event_name:      req.param('event_name'),
      event_url:       req.param('event_url'),
      organiser_name:  req.param('organiser_name'),
      organiser_url:   req.param('organiser_url'),
      address_field:   req.param('address_field'),
      location_url:    req.param('location_url'),
      start_date:      req.param('start_date'),
      end_date:        req.param('end_date'),
      comments:        req.param('comments')
    })
    .success(function(race) { // using 'race', as event is a keyword 
      race.setCity(city).success(function() {
        res.redirect('/events/' + city.city_name)
      })
    })
  })
}

// Display a single event in city
exports.individual = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
         Sequelize.and(
           {CityId: city.id},
           {event_name: req.param('event_name')}
         )
      }
    )
    .success(function(race) {
      db.SocialLink.findAll({where: {EventId: race.id}})
      .success(function(slink) {
        sequelize.query('select Tags.id as id, Tags.tag_name as tag_name, linkedTags.id as linkedTagsid, linkedTags.TagId as linkedTagsTagId, linkedTags.EventId as linkedTagsEventId from Tags left outer join (select * from EventTags where EventTags.EventId = :eventId) linkedTags on Tags.id = linkedTags.TagId where linkedTags.EventId is null', null, { raw: true }, { eventId: race.id })
        .success(function(tags) {
          sequelize.query('select EventTags.id as id, Tags.tag_name as tag_name from EventTags inner join Tags on EventTags.TagId = Tags.id where EventTags.EventId = :eventId', null, { raw: true }, {eventId: race.id})
          .success(function(linked_tags) {
            db.PhoneNumber.findAll({where: {EventId: race.id}})
            .success(function(numbers) {
              db.Email.findAll({where: {EventId: race.id}})
              .success(function(mails) {
                res.render('event', {
                  race: race,
                  social_links: slink,
                  tags: tags,
                  numbers: numbers,
                  mails: mails,
                  linked_tags: linked_tags
                })
              })
            })
          })
        })
      })
    })
  })
}

// Modify, rather update, event with missing fields
exports.modify = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(retailer) {
      retailer.updateAttributes({
        event_name:      req.param('event_name_new'),
        event_url:       req.param('event_url'),
        organiser_name:  req.param('organiser_name'),
        organiser_url:   req.param('organiser_url'),
        address_field:   req.param('address_field'),
        location_url:    req.param('location_url'),
        comments:        req.param('comments')
      })
      .success(function(race) {
        if(req.param('social_link')) {
          db.SocialLink.create({
            link: req.param('social_link')
          })
          .success(function(slink) {
            slink.setEvent(race).success(function() {
              res.redirect('/events/' + city.city_name + '/' + race.event_name)
            })
          })
        } else {
          res.redirect('/events/' + city.city_name + '/' + race.event_name)
        }
      })
    })
  })
}

// Added separate route for modifying start date as in the old way where all
// fields were being modified together dates were not being handled properly
// i.e. if the date was not modified the db value was still being changed to
// something like 0000-00-00
exports.modify_start_date = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(retailer) {
      retailer.updateAttributes({
        start_date:        req.param('start_date')
      })
      .success(function(race) {
        res.redirect('/events/' + city.city_name + '/' + race.event_name)
      })
    })
  })
}

// Added separate route for modifying end date as in the old way where all
// fields were being modified together dates were not being handled properly
// i.e. if the date was not modified the db value was still being changed to
// something like 0000-00-00
exports.modify_end_date = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(retailer) {
      retailer.updateAttributes({
        end_date:        req.param('end_date')
      })
      .success(function(race) {
        res.redirect('/events/' + city.city_name + '/' + race.event_name)
      })
    })
  })
}

//
exports.cities = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('events',
    {title: 'List of events by city',
     cities: cities});
  })
}

// Add a new tag and associate it with event 
exports.add_tag = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(race) {
      if(req.param('new_tag')) {
        db.Tag.create(
        {
          tag_name: req.param('new_tag')
        })
        .success(function(tag) {
          db.EventTag.create({
            cor_name: ''
          })
          .success(function(event_tag) {
            event_tag.setEvent(race).success(function() {
              event_tag.setTag(tag).success(function() {
                res.redirect('/events/' + city.city_name + '/' +
                             race.event_name)
              })
            })
          })
        })
      } else {
        res.redirect('/events/' + city.city_name + '/' +
                     race.event_name)
      }
    })
  })
};

// Choose a tag from existing tags to be associated with event
exports.choose_tag = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(race) {
      db.EventTag.create({
        cor_name: ''
      })
      .success(function(event_tag) {
        db.Tag.find({where: {id: req.param('tag_id')}})
        .success(function(tag) {
          event_tag.setEvent(race).success(function() {
            event_tag.setTag(tag).success(function() {
              res.redirect('/events/' + city.city_name + '/' +
                           race.event_name)
            })
          })
        })
      })
    })
  })
};

// Add a new social link for this event
exports.add_slink = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(race) {
      if(req.param('social_link')) {
        db.SocialLink.create(
        {
          link: req.param('social_link')
        })
        .success(function(slink) {
          slink.setEvent(race).success(function() {
            res.redirect('/events/' + city.city_name + '/' +
                             race.event_name)
          })
        })
      } else {
        res.redirect('/events/' + city.city_name + '/' +
          race.event_name)
      }
    })
  })
};

// Add a new phone number for this event
exports.add_phone = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(race) {
      if(req.param('phone_number')) {
        db.PhoneNumber.create(
        {
          number: req.param('phone_number')
        })
        .success(function(number) {
          number.setEvent(race).success(function() {
            res.redirect('/events/' + city.city_name + '/' +
                             race.event_name)
          })
        })
      } else {
        res.redirect('/events/' + city.city_name + '/' +
          race.event_name)
      }
    })
  })
};

// Add a new email for this event
exports.add_email = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Event.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {event_name: req.param('event_name')}
        )
      }
    )
    .success(function(race) {
      if(req.param('email')) {
        db.Email.create(
        {
          email: req.param('email')
        })
        .success(function(email) {
          email.setEvent(race).success(function() {
            res.redirect('/events/' + city.city_name + '/' +
                             race.event_name)
          })
        })
      } else {
        res.redirect('/events/' + city.city_name + '/' +
          race.event_name)
      }
    })
  })
};

exports.destroy_slink = function(req, res) {
  db.SocialLink.find({where: {id: req.param('slink_id')}})
  .success(function(slink) {
    slink.destroy().success(function() {
      res.redirect('/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.destroy_number = function(req, res) {
  db.PhoneNumber.find({where: {id: req.param('number')}})
  .success(function(number) {
    number.destroy().success(function() {
      res.redirect('/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.destroy_email = function(req, res) {
  db.Email.find({where: {id: req.param('email_id')}})
  .success(function(email) {
    email.destroy().success(function() {
      res.redirect('/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.dissociate_tag = function(req, res) {
  db.EventTag.find({where: {id: req.param('tag_id')}})
  .success(function(tag) {
    tag.destroy().success(function() {
      res.redirect('/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

// experimenting
// all upcoming events
//exports.upcoming_events = function(req,res) {
//  sequelize.query('select * from Events where start_date > NOW()', null, {raw: true} )
//  sequelize.query('select  from Events where start_date ')
//  //select * from Events where start_date > NOW() order by start_date
// select date_format(start_date, '%c %M %Y') start_date from Events
// select id, event_name, event_url, organiser_name, organiser_url, address_field, location_url, date_format(start_date, '%c, %M, %Y') start_date, date_format(end_date, %c, %M, %Y)  end_date, comments, CityId from Events where start_date > NOW() order by start_date;
//  .success(function(races) {
//    res.render('', {})
//}
