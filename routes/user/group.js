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
    to: 'sremog@gmail.com',
    subject: 'New group ' + req.param('group_name'),
    text: 'Name of group: ' + req.param('group_name') + '\nLocation: ' + req.param('location') + '\nWebsite URL: ' + req.param('group_url') + '\nDescription: ' + req.param('description') 
  }
  mail_transport.sendMail(mail_options, function(error, info) {
    if(error) {
      console.log('Error occurred: ' + JSON.stringify(error));
      res.redirect('/app/groups/grouped')
      // TODO: fix redirection
    }
    else {
      console.log('Message sent: ' + JSON.stringify(info));
      res.redirect('/app/groups/grouped')
    }
  })
}
// Routing for list of groups
exports.all = function(req, res) {
  var tag = req.param('activity');
  var loc = req.param('location');
  // All locations and all activities
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { 
    group_all_loc_all_tags(req, res )
  }
  // All locations and a chosen activity
  else if (loc == 0) {
    group_all_loc_chosen_tag(req, res)
  }
  // All activities for a chosen location
  else if (tag == 0) {
    group_chosen_loc_all_tags(req, res)
  }
  // Chosen activities for a chosen location
  else {
    group_chosen_loc_chosen_tag(req, res)
  }
}

// 4 possibilities
// location : all, tag: all
// location : chosen, tag: all
// location : all, tag: chosen 
// location : chosen, tag: chosen 

// All locations all tags
// But isn't this relatively useless?
var group_all_loc_all_tags = function(req, res ) {
  db.Group.findAll({
    attributes: [
      'id',
      'img_url_square',
      'group_name_slug',
      'group_name'],
    include: [
      db.City, 
      {
        model: db.GroupTag,
        include: [db.Tag]
      }]
  })
  .success(function(groups) {
    db.City.findAll()
    .success(function(cities) {
      db.Tag.findAll()
      .success(function(tags) {
        res.render('user/group', {
          active_tab: 'groups',
          title_: 'All Active Outdoor Groups',
          groups: groups,
          cities: cities,
          mode: 'all_tag_all_loc',
          loc: req.param('location'),
          activity: req.param('activity'),
          tags: tags
        })
      })
    })
  })
}

// Chosen location all tags
var group_chosen_loc_all_tags = function(req, res) {
  db.Group.findAll({
    attributes: [
      'id',
      'img_url_square',
      'group_name_slug',
      'group_name'],
    include: [
      db.City,
      {
        model: db.GroupTag,
        include: [db.Tag]
      }],
    where: ["CityId = " + req.param('location')]
  })
  .success(function(groups) {
    db.City.find({where: {id: req.param('location')}})
    .success(function(city) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/group', {
            active_tab: 'groups',
            title_: 'All Outdoor Groups in ' + city.city_name,
            mode: 'all_tag_cho_loc',
            groups: groups,
            cities: cities,
            city: city,
            loc: req.param('location'),
            activity: req.param('activity'),
            tags: tags
          })
        })
      })
    })
  })
}

// All locations chosen tag
var group_all_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.GroupTag.findAll({
      where: ["TagId = " + tag.id],
      include: [
        {
          model: db.Group,
          attributes: [
            'id',
            'img_url_square',
            'group_name_slug',
            'group_name'
          ],
          include: [db.City]
        }],
      raw: true
    })
    .success(function(group_tags) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/group', {
            active_tab: 'groups',
            title_: 'All ' + tag.tag_name + ' Groups',
            tag: tag, // chosen tag
            group_tags: group_tags, // these contain groups to be displayed
            cities: cities,
            mode: 'cho_tag_all_loc',
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
var group_chosen_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.GroupTag.findAll({
      where: ['TagId= ' + tag.id],
      include: [{
          model: db.Group,
          where: ["CityId = " + req.param('location')],
          include: [db.City],
          attributes: [
            'id',
            'img_url_square',
            'group_name_slug',
            'group_name'
          ]
        }]
    })
    .success(function(group_tags) {
      db.City.find({where: {id: req.param('location')}})
      .success(function(city) {
        db.City.findAll()
        .success(function(cities) {
          db.Tag.findAll()
          .success(function(tags) {
            res.render('user/group', {
              active_tab: 'groups',
              title_: 'All ' + tag.tag_name + ' Groups in ' + city.city_name,
              tag: tag,
              group_tags: group_tags,
              cities: cities,
              city: city,
              mode: 'cho_tag_cho_loc',
              loc: req.param('location'),
              activity: req.param('activity'),
              tags: tags
            })
          })
        })
      })
    })
  })
}

////////////////////////////////////////////
// Grouped grouped by activity/location //
////////////////////////////////////////////

exports.all_grouped = function(req, res) {
  var tag  = req.param('activity');
  var loc  = req.param('location');
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { // All locations and all activities
    group_grouped(req, res) 
  }
  else if (loc == 0 || loc == null) { // All locations and a chosen activity
    group_grouped_by_location_chosen_tag(req, res)
  }
  else if (tag == 0 || tag == null) { // All activities for a chosen location
    group_grouped_by_activity_chosen_loc(req, res)
  }
  else {
    // not grouped
    group_chosen_loc_chosen_tag(req, res)
  }
}

// All activities, all tags (Grouped by activity)
var group_grouped = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.GroupTag.count({
          where: {TagId: t.id}
        })
        .then(function(group_count) {
          tag = t.toJSON();
          tag.group_count = group_count;
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
          db.Group.count({
            where: {CityId: c.id}
          })
          .then(function(group_count) {
            city = c.toJSON();
            city.group_count = group_count;
            return city;
          })
        )
      })
      return Promise.all(promises)
    })
    .then(function(cities_c) {
      res.render('user/group_groups', {
        active_tab: 'groups',
        title_: 'All Active Outdoor Groups across India',
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
var group_grouped_by_activity_chosen_loc = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.Group.count({
          include: [{
            model: db.GroupTag,
            where: {TagId: t.id}
          }],
          where: {CityId: req.param('location')}
        })
        .then(function(group_count) {
          tag = t.toJSON();
          tag.group_count = group_count;
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
        res.render('user/group_groups', {
          active_tab: 'groups',
          title_: 'All Active Outdoor Groups in ' + city.city_name,
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

var group_grouped_by_location_chosen_tag = function(req, res) {
  db.City.findAll()
  .then(function(cities) {
    console.log(JSON.stringify(cities))
    var promises = []
    var city
    cities.forEach(function(c) {
      promises.push(
        db.Group.count({
          where: {CityId: c.id},
          include: [{
            model: db.GroupTag,
            where: {TagId: req.param('activity')}
          }]
        })
        .then(function(group_count) {
          city = c.toJSON();
          city.group_count = group_count;
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
        res.render('user/group_groups', {
          active_tab: 'groups',
          title_: 'All ' + tag.tag_name + ' Groups across India',
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

// Individual groups
exports.individual = function(req, res) {
  db.Group.find({
    where: {id: req.param('group_id')},
    include: [ 
      db.City,
      db.Email,
      db.SocialLink,
      db.PhoneNumber,
      {
        model: db.GroupTag,
        include: [db.Tag]}
      ],
    attributes: [
      'id',
      'group_name',
      'img_url_square',
      'group_name_slug',
      'group_url',
      'comments']
  })
  .success(function(group) {
     res.render('user/individual_group', {
       active_tab: 'groups',
       title_: group.group_name + ' in ' + group.City.city_name,
       group: group}) 
  }) 
}
