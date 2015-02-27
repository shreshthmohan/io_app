var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');
var mail_transport = require('./index').transporter;

// User form to email
exports.user_submission = function(req, res) {
  var email = req.param('email') ? req.param('email') : 'anon@email.com';
  var mail_options = {
    from: email,
    to: 'team@indiaoutside.org',
    subject: 'New store ' + req.param('retailer_name'),
    text: 'Name of retailer: ' + req.param('retailer_name') + '\nLocation: ' + req.param('location') + '\nAddress: ' + req.param('address_field') + '\nWebsite URL: ' + req.param('website_url') + '\nMaps link: ' + req.param('location_url') + '\nDescription: ' + req.param('description') 
  }
  mail_transport.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log('Error occurred: ' + JSON.stringify(error));
      res.redirect('/app/gear/grouped')
      // TODO: fix redirection
    }
    else {
      console.log('Message sent: ' + JSON.stringify(info));
      res.redirect('/app/gear/grouped')
    }
  })
}

// User form to report error in stored information
exports.user_error = function(req, res) {
  var email = req.param('email_error') ? req.param('email_error') : 'anon@email.com';
  var mail_options = {
    from: email,
    to: 'team@indiaoutside.org',
    subject: 'Error with retailer_id = ' + req.param('retailer_id'),
    text: 'Errata list: ' + req.param('errata_list') + '\nError description: ' + req.param('error_description')
  }
  mail_transport.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log('Error occurred: ' + JSON.stringify(error));
      res.redirect('/app/gear/' + req.param('retailer_city') + '/' + req.param('retailer_name') + '/' + req.param('retailer_id'))
    }
    else {
      console.log('Message sent: ' + JSON.stringify(info));
      res.redirect('/app/gear/' + req.param('retailer_city') + '/' + req.param('retailer_name') + '/' + req.param('retailer_id'))
    }
  })
}

// User form to provide additional information about retailer
exports.user_info = function(req, res) {
  var email = req.param('email_info') ? req.param('email_info') : 'anon@email.com';
  var mail_options = {
    from: email,
    to: 'team@indiaoutside.org',
    subject: 'Missing info about retailer_id = ' + req.param('retailer_id'),
    text: 'Missing list: ' + req.param('missing_list') + '\nError description: ' + req.param('missing_description')
  }
  mail_transport.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log('Error occurred: ' + JSON.stringify(error));
      res.redirect('/app/gear/' + req.param('retailer_city') + '/' + req.param('retailer_name') + '/' + req.param('retailer_id'))
    }
    else {
      console.log('Message sent: ' + JSON.stringify(info));
      res.redirect('/app/gear/' + req.param('retailer_city') + '/' + req.param('retailer_name') + '/' + req.param('retailer_id'))
    }
  })
}

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
          title_: 'All Gear Retailers across India',
          mode: 'all_tag_all_loc',
          retailers: retailers,
          loc: req.param('location'),
          activity: req.param('activity'),
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
            city: city,
            retailers: retailers,
            mode: 'all_tag_cho_loc',
            loc: req.param('location'),
            activity: req.param('activity'),
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
            mode: 'cho_tag_all_loc',
            tag: tag, // chosen tag
            gear_tags: gear_tags, // these contain retailers to be displayed
            cities: cities,
            loc: req.param('location'),
            activity: req.param('activity'),
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
              mode: 'cho_tag_cho_loc',
              tag: tag,
              city: city,
              gear_tags: gear_tags,
              loc: req.param('location'),
              activity: req.param('activity'),
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
    gear_grouped (req, res) 
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

// All activities, all tags (Grouped both by activity and location)
var gear_grouped = function(req, res) {
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
      var promises = []
      var city
      cities.forEach(function(c) {
        promises.push(
          db.Retailer.count({
            where: {CityId: c.id}
          })
          .then(function(retailer_count) {
            city = c.toJSON();
            city.retailer_count = retailer_count;
            return city;
          })
        )
      })
      return Promise.all(promises)
    })
    .then(function(cities_c) {
      res.render('user/gear_groups', {
        active_tab: 'gear',
        title_: 'All outdoor, adventure stores and retailers across India',
        tags: tags_c,
        group_mode: 'all_tag_all_loc',
        cities: cities_c,
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
     console.log(JSON.stringify(retailer))
     res.render('user/individual_retailer', {
       active_tab: 'gear',
       title_: retailer.retailer_name + ' in ' + retailer.City.city_name,
       retailer: retailer}) 
  }) 
}
