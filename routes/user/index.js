var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var Promise = require('bluebird');

// 'Mail by user' bunch
var nodemailer = require('nodemailer');
var mg = require('nodemailer-mailgun-transport');

var auth = {
  auth: {
    domain: process.env.MG_DOMAIN,
    api_key: process.env.MG_API_KEY
  }
}

exports.transporter = nodemailer.createTransport(mg(auth));

exports.index = function(req, res) {
  db.Tag.findAll()
  .then(function(tags) {
    var promises = [] // array to be filled with function calls
    var tag
    tags.forEach(function(t) {
      promises.push(
        Promise.all([
          db.EventTag.count({
            where: {TagId: t.id},
            include: [{
              model: db.Event,
              where: ['start_date > NOW()']
            }]
          }),
          db.GearTag.count({
            where: {TagId: t.id}
          }),
          db.GroupTag.count({
            where: {TagId: t.id}
          }),
          db.SchoolTag.count({
            where: {TagId: t.id}
          })
        ])
        .spread(function(event_count, retailer_count, group_count, school_count) {
          tag = t.toJSON();
          tag.event_count = event_count;
          tag.retailer_count = retailer_count;
          tag.group_count = group_count;
          tag.school_count = school_count;
          return tag
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
          Promise.all([
            db.Event.count({
              where: Sequelize.and(
                {CityId: c.id},
                {start_date: {gt: new Date()}})
            }),
            db.Retailer.count({
              where: {CityId: c.id}
            }),
            db.Group.count({
              where: {CityId: c.id}
            }),
            db.School.count({
              where: {CityId: c.id}
            })
          ])
          .spread(function(event_count, retailer_count, group_count, school_count) {
            city = c.toJSON();
            city.event_count    = event_count;
            city.retailer_count = retailer_count;
            city.group_count    = group_count;
            city.school_count   = school_count;
            return city
          })
        )
      })
      return Promise.all(promises)
    })
    .then(function(cities_c) {
      res.render('user/index', {
        active_tab: 'home',
        title_: 'Adventure Outdoors - Running, Cycling, Trekking, Surfing, Kayaking, Rafting, Slacklining, Skateboarding & More ',
        cities: cities_c,
        tags: tags_c
      })
    })
  })
}

exports.teach_cg = function(req, res) {
  res.render('user/teach_cg');
}
