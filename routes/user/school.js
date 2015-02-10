var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');

// Routing for list of schools
exports.all = function(req, res) {
  var tag = req.param('activity');
  var loc = req.param('location');
  // All locations and all activities
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { 
    all_loc_all_tags(req, res )
  }
  // All locations and a chosen activity
  else if ((loc == 0) || (loc == null)) {
    all_loc_chosen_tag(req, res)
  }
  // All activities for a chosen location
  else if ((tag == 0) || (tag == null)) {
    chosen_loc_all_tags(req, res)
  }
  // Chosen activities for a chosen location
  else {
    chosen_loc_chosen_tag(req, res)
  }
}

// 4 possibilities
// location : all, tag: all
// location : chosen, tag: all
// location : all, tag: chosen 
// location : chosen, tag: chosen 

// All locations all tags
// But isn't this relatively useless?
all_loc_all_tags = function(req, res ) {
  db.School.findAll({
    attributes: [
      'id',
      'img_url_square',
      'school_name_slug',
      'school_name'],
    include: [
      db.City, 
      {
        model: db.SchoolTag,
        include: [db.Tag]
      }]
  })
  .success(function(schools) {
    db.City.findAll()
    .success(function(cities) {
      db.Tag.findAll()
      .success(function(tags) {
        res.render('user/school', {
          active_tab: 'schools',
          title_: 'All Active Outdoor Schools',
          schools: schools,
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
chosen_loc_all_tags = function(req, res) {
  db.School.findAll({
    attributes: [
      'id',
      'img_url_square',
      'school_name_slug',
      'school_name'],
    include: [
      db.City,
      {
        model: db.SchoolTag,
        include: [db.Tag]
      }],
    where: ["CityId = " + req.param('location')]
  })
  .success(function(schools) {
    db.City.find({where: {id: req.param('location')}})
    .success(function(city) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/school', {
            active_tab: 'schools',
            title_: 'All Outdoor Schools in ' + city.city_name,
            schools: schools,
            cities: cities,
            city: city,
            mode: 'all_tag_cho_loc',
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
all_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.SchoolTag.findAll({
      where: ["TagId = " + tag.id],
      include: [
        {
          model: db.School,
          attributes: [
            'id',
            'img_url_square',
            'school_name_slug',
            'school_name'
          ],
          include: [db.City]
        }],
      raw: true
    })
    .success(function(school_tags) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/school', {
            active_tab: 'schools',
            title_: 'Learn ' + tag.tag_name + ' in India',
            tag: tag, // chosen tag
            school_tags: school_tags, // these contain schools to be displayed
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
chosen_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.SchoolTag.findAll({
      where: ['TagId= ' + tag.id],
      include: [{
          model: db.School,
          where: ["CityId = " + req.param('location')],
          include: [db.City],
          attributes: [
            'id',
            'img_url_square',
            'school_name_slug',
            'school_name'
          ]
        }]
    })
    .success(function(school_tags) {
      db.City.find({where: {id: req.param('location')}})
      .success(function(city) {
        db.City.findAll()
        .success(function(cities) {
          db.Tag.findAll()
          .success(function(tags) {
            res.render('user/school', {
              active_tab: 'schools',
              title_: 'Learn ' + tag.tag_name + ' in ' + city.city_name,
              tag: tag,
              school_tags: school_tags,
              cities: cities,
              mode: 'cho_tag_cho_loc',
              city: city,
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
// Schools grouped by activity/location //
////////////////////////////////////////////

exports.all_grouped = function(req, res) {
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
    // not grouped
    chosen_loc_chosen_tag(req, res)
  }
}

// All activities, all tags (Schooled by activity)
var grouped = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.SchoolTag.count({
          where: {TagId: t.id}
        })
        .then(function(school_count) {
          tag = t.toJSON();
          tag.school_count = school_count;
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
          db.School.count({
            where: {CityId: c.id}
          })
          .then(function(school_count) {
            city = c.toJSON();
            city.school_count = school_count;
            return city;
          })
        )
      })
      return Promise.all(promises)
    })
    .then(function(cities_c) {
      res.render('user/school_groups', {
        active_tab: 'schools',
        title_: 'All Outdoor Schools across India',
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
var grouped_by_activity_chosen_loc = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        db.School.count({
          include: [{
            model: db.SchoolTag,
            where: {TagId: t.id}
          }],
          where: {CityId: req.param('location')}
        })
        .then(function(school_count) {
          tag = t.toJSON();
          tag.school_count = school_count;
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
        res.render('user/school_groups', {
          active_tab: 'schools',
          title_: 'Learn Outdoor Sport in ' + city.city_name,
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

var grouped_by_location_chosen_tag = function(req, res) {
  db.City.findAll()
  .then(function(cities) {
    console.log(JSON.stringify(cities))
    var promises = []
    var city
    cities.forEach(function(c) {
      promises.push(
        db.School.count({
          where: {CityId: c.id},
          include: [{
            model: db.SchoolTag,
            where: {TagId: req.param('activity')}
          }]
        })
        .then(function(school_count) {
          city = c.toJSON();
          city.school_count = school_count;
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
        res.render('user/school_groups', {
          active_tab: 'schools',
          title_: 'Learn ' + tag.tag_name + ' in India',
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

// Individual schools
exports.individual = function(req, res) {
  db.School.find({
    where: {id: req.param('school_id')},
    include: [ 
      db.City,
      db.Email,
      db.SocialLink,
      db.PhoneNumber,
      {
        model: db.SchoolTag,
        include: [db.Tag]}
      ],
    attributes: [
      'id',
      'school_name',
      'img_url_square',
      'school_name_slug',
      'website_url',
      'location_url',
      'address_field',
      'comments']
  })
  .success(function(school) {
     res.render('user/individual_school', {
       active_tab: 'schools',
       title_: school.school_name + ' in ' + school.City.city_name,
       school: school}) 
  }) 
}
