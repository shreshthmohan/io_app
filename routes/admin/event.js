var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion

// Create form (GET)
exports.create_form = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin_create_event', {
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
        res.redirect('/app/admin/events/' + city.city_name)
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
                sequelize.query('select Subtags.id as id, Subtags.subtag_name as subtag_name, linkedSubtags.id as linkedSubtagsid, linkedSubtags.SubtagId as linkedSubtagsSubtagId, linkedSubtags.EventId as linkedSubtagsEventId from Subtags left outer join (select * from EventSubtags where EventSubtags.EventId = :eventId) linkedSubtags on Subtags.id = linkedSubtags.SubtagId where linkedSubtags.EventId is null', null, { raw: true }, { eventId: race.id })
                .success(function(subtags) {
                  sequelize.query('select EventSubtags.id as id, Subtags.subtag_name as subtag_name from EventSubtags inner join Subtags on EventSubtags.SubtagId = Subtags.id where EventSubtags.EventId = :eventId', null, { raw: true }, {eventId: race.id})
                  .success(function(linked_subtags) {
                    res.render('admin_event', {
                      race: race,
                      social_links: slink,
                      tags: tags,
                      numbers: numbers,
                      mails: mails,
                      linked_tags: linked_tags,
                      subtags: subtags,
                      linked_subtags: linked_subtags
                    })
                  })
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
      console.log("got event instance")
      retailer.updateAttributes({
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
              res.redirect('/app/admin/events/' + city.city_name + '/' + race.event_name)
            })
          })
        } else {
          res.redirect('/app/admin/events/' + city.city_name + '/' + race.event_name)
        }
      })
      .failure(function(error) {
        console.log(JSON.stringify(error))
        res.redirect('/app/admin/error', {error: error}) 
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
        res.redirect('/app/admin/events/' + city.city_name + '/' + race.event_name)
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
        res.redirect('/app/admin/events/' + city.city_name + '/' + race.event_name)
      })
    })
  })
}

//
exports.cities = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin_events',
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
                res.redirect('/app/admin/events/' + city.city_name + '/' +
                             race.event_name)
              })
            })
          })
        })
      } else {
        res.redirect('/app/admin/events/' + city.city_name + '/' +
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
              res.redirect('/app/admin/events/' + city.city_name + '/' +
                           race.event_name)
            })
          })
        })
      })
    })
  })
};

// subtag starts
// Add a new sub-tag and associate it with event 
exports.add_subtag = function(req, res) {
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
      if(req.param('new_subtag')) {
        db.Subtag.create(
        {
          subtag_name: req.param('new_subtag')
        })
        .success(function(subtag) {
          db.EventSubtag.create({
            cor_name: ''
          })
          .success(function(event_subtag) {
            event_subtag.setEvent(race).success(function() {
              event_subtag.setSubtag(subtag).success(function() {
                res.redirect('/app/admin/events/' + city.city_name + '/' +
                             race.event_name)
              })
            })
          })
        })
      } else {
        res.redirect('/app/admin/events/' + city.city_name + '/' +
                     race.event_name)
      }
    })
  })
};

// Choose a subtag from existing subtags to be associated with event
exports.choose_subtag = function(req, res) {
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
      db.EventSubtag.create({
        cor_name: ''
      })
      .success(function(event_subtag) {
        db.Subtag.find({where: {id: req.param('subtag_id')}})
        .success(function(subtag) {
          event_subtag.setEvent(race).success(function() {
            event_subtag.setSubtag(subtag).success(function() {
              res.redirect('/app/admin/events/' + city.city_name + '/' +
                           race.event_name)
            })
          })
        })
      })
    })
  })
};
// subtag ends

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
            res.redirect('/app/admin/events/' + city.city_name + '/' +
                             race.event_name)
          })
        })
      } else {
        res.redirect('/app/admin/events/' + city.city_name + '/' +
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
            res.redirect('/app/admin/events/' + city.city_name + '/' +
                             race.event_name)
          })
        })
      } else {
        res.redirect('/app/admin/events/' + city.city_name + '/' +
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
            res.redirect('/app/admin/events/' + city.city_name + '/' +
                             race.event_name)
          })
        })
      } else {
        res.redirect('/app/admin/events/' + city.city_name + '/' +
          race.event_name)
      }
    })
  })
};

exports.destroy_slink = function(req, res) {
  db.SocialLink.find({where: {id: req.param('slink_id')}})
  .success(function(slink) {
    slink.destroy().success(function() {
      res.redirect('/app/admin/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.destroy_number = function(req, res) {
  db.PhoneNumber.find({where: {id: req.param('number')}})
  .success(function(number) {
    number.destroy().success(function() {
      res.redirect('/app/admin/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.destroy_email = function(req, res) {
  db.Email.find({where: {id: req.param('email_id')}})
  .success(function(email) {
    email.destroy().success(function() {
      res.redirect('/app/admin/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.dissociate_tag = function(req, res) {
  db.EventTag.find({where: {id: req.param('tag_id')}})
  .success(function(tag) {
    tag.destroy().success(function() {
      res.redirect('/app/admin/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};

exports.dissociate_subtag = function(req, res) {
  db.EventSubtag.find({where: {id: req.param('subtag_id')}})
  .success(function(subtag) {
    subtag.destroy().success(function() {
      res.redirect('/app/admin/events/' + req.param('city_name') + '/' +
        req.param('event_name'));
    })
  })
};
