var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');
var mail_transport = require('./index').transporter;

exports.index = function(req, res) {
  db.Tag.find({
    where: {id: req.param('tag_id')}
  })
  .success(function(tag) {
    db.City.findAll()
    .then(function(cities) {
      var promises = []
      var city
      cities.forEach(function(c) {
        promises.push(
          Promise.all([
            db.EventTag.findAll({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.Event,
                where: Sequelize.and(
                  {start_date: {gte: new Date()}},
                  {CityId: c.id}
                ),
                order: 'start_date ASC',
                attributes: [
                  'id',
                  'event_name',
                  'event_name_slug',
                  'img_url_square',
                  [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']],
              }]
            }),
            db.EventTag.count({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.Event,
                where: Sequelize.and(
                  {start_date: {gte: new Date()}},
                  {CityId: c.id}
                )
              }]
            }),
            db.GearTag.findAll({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.Retailer,
                where: {CityId: c.id},
                attributes: [
                  'id',
                  'retailer_name',
                  'retailer_name_slug',
                  'img_url_square'
                ]
              }]
            }),
            db.GearTag.count({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.Retailer,
                where: {CityId: c.id}
              }]
            }),
            db.GroupTag.findAll({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.Group,
                where: {CityId: c.id},
                attributes: [
                  'id',
                  'group_name',
                  'group_name_slug',
                  'img_url_square'
                ]
              }]
            }),
            db.GroupTag.count({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.Group,
                where: {CityId: c.id}
              }]
            }),
            db.SchoolTag.findAll({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.School,
                where: {CityId: c.id},
                attributes: [
                  'id',
                  'school_name',
                  'school_name_slug',
                  'img_url_square'
                ]
              }]
            }),
            db.SchoolTag.count({
              where: {TagId: req.param('tag_id')},
              include: [{
                model: db.School,
                where: {CityId: c.id}
              }]
            })
          ])
          .spread(function(events, event_count, retailers, retailer_count,
                           groups, group_count, schools, school_count) {
            city = c.toJSON();
            city.events         = events;
            city.event_count    = event_count;
            city.retailers      = retailers;
            city.retailer_count = retailer_count;
            city.groups         = groups;
            city.group_count    = group_count;
            city.schools        = schools;
            city.school_count   = school_count;
            return city
          })
        )

      })
      return Promise.all(promises);
    })
    .then(function(cities_c) {
      console.log(JSON.stringify(cities_c))
      res.render('user/activity', {
        title_: tag.tag_name + ' in India: Events, Races, Outdoor Schools, Groups, Gear stores',
        cities: cities_c,
        tag: tag
      })
    })
  })
}
