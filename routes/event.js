var db = require('../models');
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
      event_url_social:req.param('event_url_social'),
      organiser_name:  req.param('organiser_name'),
      organiser_url:   req.param('organiser_url'),
      address_field:   req.param('address_field'),
      location_url:    req.param('location_url'),
      start_date:      req.param('start_date'),
      end_date:        req.param('end_date'),
      phone_primary:   req.param('phone_primary'),
      phone_secondary: req.param('phone_secondary'),
      phone_tertiary:  req.param('phone_tertiary'),
      email:           req.param('email'),
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
          sequelize.query('select * from EventTags inner join Tags on EventTags.TagId = Tags.id where EventTags.EventId = :eventId', null, { raw: true }, {eventId: race.id})
          .success(function(linked_tags) {
            res.render('event', {
              race: race,
              social_links: slink,
              tags: tags,
              linked_tags: linked_tags
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
        event_name:      req.param('event_name'),
        event_url:       req.param('event_url'),
        event_url_social:req.param('event_url_social'),
        organiser_name:  req.param('organiser_name'),
        organiser_url:   req.param('organiser_url'),
        address_field:   req.param('address_field'),
        location_url:    req.param('location_url'),
        start_date:      req.param('start_date'),
        end_date:        req.param('end_date'),
        phone_primary:   req.param('phone_primary'),
        phone_secondary: req.param('phone_secondary'),
        phone_tertiary:  req.param('phone_tertiary'),
        email:           req.param('email'),
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
