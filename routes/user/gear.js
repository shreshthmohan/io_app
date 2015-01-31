var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');

// Note: tag and activity have been used interchangeably

// Routing for list of gear retailers
exports.all = function(req, res) {
  var tag = req.param('activity');
  var loc = req.param('location');
  // All locations and all activities
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { 
    gear_all_loc_all_tags(req, res )
  }
  // All locations and a chosen activity
  else if ((loc == 0) || (loc== null)) {
    gear_all_loc_chosen_tag(req, res)
  }
  // All activities for a chosen location
  else if ((tag == 0) || (tag == null)) {
    gear_chosen_loc_all_tags(req, res)
  }
  // Chosen activities for a chosen location
  else {
    gear_chosen_loc_chosen_tag(req, res)
  }
}

// 4 possibilities
// location : all, tag: all
// location : chosen, tag: all
// location : all, tag: chosen 
// location : chosen, tag: chosen 

// All locations all tags
// But isn't this relatively useless?
var gear_all_loc_all_tags = function(req, res ) {
  db.Retailer.findAll({
    attributes: [
      'id',
      'img_url_square',
      'retailer_name_slug',
      'retailer_name'],
    include: [
      db.City, 
      {
        model: db.GearTag,
        include: [db.Tag]
      }]
  })
  .success(function(retailers) {
    db.City.findAll()
    .success(function(cities) {
      db.Tag.findAll()
      .success(function(tags) {
        res.render('user/gear', {
          active_tab: 'gear',
          title_: 'All Gear Retailers',
          retailers: retailers,
          cities: cities,
          tags: tags
        })
      })
    })
  })
}

// Chosen location all tags
var gear_chosen_loc_all_tags = function(req, res) {
  db.Retailer.findAll({
    attributes: [
      'id',
      'img_url_square',
      'retailer_name_slug',
      'retailer_name'],
    include: [
      db.City,
      {
        model: db.GearTag,
        include: [db.Tag]
      }],
    where: ["CityId = " + req.param('location')]
  })
  .success(function(retailers) {
    db.City.find({where: {id: req.param('location')}})
    .success(function(city) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/gear', {
            active_tab: 'gear',
            title_: 'All Gear Retailers in ' + city.city_name,
            retailers: retailers,
            cities: cities,
            tags: tags
          })
        })
      })
    })
  })
}

// All locations chosen tag
var gear_all_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.GearTag.findAll({
      where: ["TagId = " + tag.id],
      include: [
        {
          model: db.Retailer,
          attributes: [
            'id',
            'img_url_square',
            'retailer_name_slug',
            'retailer_name'
          ],
          include: [db.City]
        }],
      raw: true
    })
    .success(function(gear_tags) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/gear', {
            active_tab: 'gear',
            title_: 'All ' + tag.tag_name + ' Gear Retailers',
            tag: tag, // chosen tag
            gear_tags: gear_tags, // these contain retailers to be displayed
            cities: cities,
            tags: tags // all tags for filter bar
          })
        })
      })
    })
  })
}

// Chosen location chosen tag
var gear_chosen_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.GearTag.findAll({
      where: ['TagId= ' + tag.id],
      include: [{
          model: db.Retailer,
          where: ["CityId = " + req.param('location')],
          include: [db.City],
          attributes: [
            'id',
            'img_url_square',
            'retailer_name_slug',
            'retailer_name'
          ]
        }]
    })
    .success(function(gear_tags) {
      db.City.find({where: {id: req.param('location')}})
      .success(function(city) {
        db.City.findAll()
        .success(function(cities) {
          db.Tag.findAll()
          .success(function(tags) {
            res.render('user/gear', {
              active_tab: 'gear',
              title_: 'All ' + tag.tag_name + ' Gear Retailers in ' + city.city_name,
              tag: tag,
              gear_tags: gear_tags,
              cities: cities,
              tags: tags
            })
          })
        })
      })
    })
  })
}

////////////////////////////////////////////
// Retailers grouped by activity/location //
////////////////////////////////////////////

exports.all_grouped = function(req, res) {
  var tag  = req.param('activity');
  var loc  = req.param('location');
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { // All locations and all activities
    gear_grouped_by_activity(req, res) 
  }
  else if (loc == 0 || loc == null) { // All locations and a chosen activity
    gear_grouped_by_location_chosen_tag(req, res)
  }
  else if (tag == 0 || tag == null) { // All activities for a chosen location
    gear_grouped_by_activity_chosen_loc(req, res)
  }
  else {
    // not grouped
    gear_chosen_loc_chosen_tag(req, res)
  }
}

// All activities, all tags (Grouped by activity)
var gear_grouped_by_activity = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.GearTag.count({
          where: {TagId: t.id}
        })
        .then(function(retailer_count) {
          tag = t.toJSON();
          tag.retailer_count = retailer_count;
          return tag;
        })
      )
    })
    return Promise.all(promises);
  })
  .then(function(tags_c) {
    db.City.findAll()
    .then(function(cities) {
      res.render('user/gear_groups', {
        active_tab: 'gear',
        title_: 'All outdoor, adventure stores and retailers across India',
        tags: tags_c,
        group_mode: 'all_tag_all_loc',
        cities: cities,
        activity: req.param('activity'),
        loc: req.param('location')
      })
    })
  })
}

// All activites, chosen location; grouped by activity
var gear_grouped_by_activity_chosen_loc = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.Retailer.count({
          include: [{
            model: db.GearTag,
            where: {TagId: t.id}
          }],
          where: {CityId: req.param('location')}
        })
        .then(function(retailer_count) {
          tag = t.toJSON();
          tag.retailer_count = retailer_count;
          return tag
        })
      )
    })
    return Promise.all(promises);
  })
  .then(function(tags_c) {
    db.City.find({where: {id: req.param('location')}})
    .then(function(city) {
      db.City.findAll()
      .then(function(cities) {
        res.render('user/gear_groups', {
          active_tab: 'gear',
          title_: 'All outdoor, adventure stores and retailers in ' + city.city_name,
          group_mode: 'all_tag_cho_loc',
          tags: tags_c,
          city: city,
          cities: cities,
          activity: req.param('activity'),
          loc: req.param('location')
        })
      })
    })
  })
}

var gear_grouped_by_location_chosen_tag = function(req, res) {
  db.City.findAll()
  .then(function(cities) {
    var promises = []
    var city
    cities.forEach(function(c) {
      promises.push(
        db.Retailer.count({
          where: {CityId: c.id},
          include: [{
            model: db.GearTag,
            where: {TagId: req.param('activity')}
          }]
        })
        .then(function(retailer_count) {
          city = c.toJSON();
          city.retailer_count = retailer_count;
          return city
        })
      )
    })
    return Promise.all(promises)
  })
  .then(function(cities_c) {
    db.Tag.findOne({where: {id: req.param('activity')}})
    .then(function(tag) {
      db.Tag.findAll()
      .then(function(tags) {
        res.render('user/gear_groups', {
          active_tab: 'gear',
          title_: 'All stores and retailers with ' + tag.tag_name + ' gear',
          group_mode: 'cho_tag_all_loc',
          cities: cities_c,
          tags: tags,
          tag: tag,
          activity: req.param('activity'),
          loc: req.param('location')
        })
      })
    })
  })
}

// Individual retailers
exports.individual = function(req, res) {
  db.Retailer.find({
    where: {id: req.param('retailer_id')},
    include: [ 
      db.City,
      db.Email,
      db.SocialLink,
      db.PhoneNumber,
      {
        model: db.GearTag,
        include: [db.Tag]}
      ],
    attributes: [
      'id',
      'retailer_name',
      'img_url_square',
      'retailer_name_slug',
      'website_url',
      'location_url',
      'address_field',
      'comments']
  })
  .success(function(retailer) {
     res.render('user/individual_retailer', {
       active_tab: 'gear',
       title_: retailer.retailer_name + ' in ' + retailer.City.city_name,
       retailer: retailer}) 
  }) 
}
