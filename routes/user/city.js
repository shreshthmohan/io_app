var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');

var render_page = function(city, req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = []
    var tag
    tags.forEach(function(t) {
      promises.push(
        Promise.all([
          db.EventTag.findAll({
            where: {TagId: t.id},
            include: [{
              model: db.Event,
              where: Sequelize.and(
                {start_date: {gte: new Date()}},
                {CityId: city.id}
              ),
              order: 'start_date ASC',
              attributes: [
                'id',
                'event_name',
                'event_name_slug',
                'img_url_square',
                [Sequelize.fn('date_format', Sequelize.col('start_date'), '%e %M %Y'), 'start_date_f']]
            }]
          }),
          db.EventTag.count({
            where: {TagId: t.id},
            include: [{
              model: db.Event,
              where: Sequelize.and(
                {start_date: {gte: new Date()}},
                {CityId: city.id}
              )
            }]
          }),
          db.GearTag.findAll({
            where: {TagId: t.id},
            include: [{
              model: db.Retailer,
              where: {CityId: city.id},
              attributes: [
                'id',
                'retailer_name',
                'retailer_name_slug',
                'img_url_square'
              ]
            }]
          }),
          db.GearTag.count({
            where: {TagId: t.id},
            include: [{
              model: db.Retailer,
              where: {CityId: city.id}
            }]
          }),
          db.GroupTag.findAll({
            where: {TagId: t.id},
            include: [{
              model: db.Group,
              where: {CityId: city.id},
              attributes: [
                'id',
                'group_name',
                'group_name_slug',
                'img_url_square'
              ]
            }]
          }),
          db.GroupTag.count({
            where: {TagId: t.id},
            include: [{
              model: db.Group,
              where: {CityId: city.id}
            }]
          }),
          db.SchoolTag.findAll({
            where: {TagId: t.id},
            include: [{
              model: db.School,
              where: {CityId: city.id},
              attributes: [
                'id',
                'school_name',
                'school_name_slug',
                'img_url_square'
              ]
            }]
          }),
          db.SchoolTag.count({
            where: {TagId: t.id},
            include: [{
              model: db.School,
              where: {CityId: city.id}
            }]
          })
        ])
        .spread(function(events, event_count, retailers, retailer_count,
                         groups, group_count, schools, school_count) {
          tag = t.toJSON();
          tag.events         = events;
          tag.event_count    = event_count;
          tag.retailers      = retailers;
          tag.retailer_count = retailer_count;
          tag.groups         = groups;
          tag.group_count    = group_count;
          tag.schools        = schools;
          tag.school_count   = school_count;
          return tag; 
        })
      )
    })
    return Promise.all(promises);
  })
  .then(function(tags_e) {
    res.render('user/city', {
      title_: city.city_name + ': Adventure Outdoors, Events, Races, Outdoors Schools, Groups, Gear stores',
      tags: tags_e,
      city: city
    })
  })
}

exports.redir = function(req, res) {
  db.City.find({
    where: {id: req.param('city_id')}
  })
  .success(function(city) {
    res.redirect(301, '/city/' + city.id + '/' + city.city_name_slug)
  })
}

exports.check = function(req, res) {
  db.City.find({
    where: {id: req.param('city_id')}
  })
  .success(function(city) {
    if (req.param('city_name_slug') == city.city_name_slug) {
      render_page(city, req, res)
    }
    else {
      res.redirect(301, '/city/' + city.id + '/' + city.city_name_slug)
    }
  })
}
