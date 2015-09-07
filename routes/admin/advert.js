var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion
var slugify = require('./slugify');
var Promise = require('bluebird');

exports.create_form = function(req, res) {
  Promise.all([
    db.Tag.findAll(),
    db.City.findAll()
  ])
  .spread(function(tags, cities) {
    res.render('admin/create_advert', {
      title: 'Create your advertisement',
      tags: tags,
      cities: cities
    })
  })
}

exports.create_ = function(req, res) {
        console.log(req.body)
}

exports.create = function(req, res) {
  db.Advert.create({
    title:                req.body.title,
    description:          req.body.description,
    image_url:            req.body.image_url,
    web_url:              req.body.web_url,
    campaign_start_date:  req.body.campaign_start_date,
    campaign_end_date:    req.body.campaign_end_date,
    active:               req.body.active || true,
    // true is default, not really executing logic, i.e. will be set true iff
    // either body value is true or no value was provided. If value provided
    // is false DB will get false (and not 0 || 1 = 1)
    all:                  req.body.all || false
  })
  .then(function(ad) {
    var tags   = req.body.tags
    var cities = req.body.cities
    // TODO handle empty array and single element array cases too
    // Also the "all" case
    console.log("associating new advert with tags and cities")
    var promises = []
    if(typeof tags != "undefined") {
      if(tags.length > 1) {
        console.log("tags is an array")
        tags.forEach(function(t) {
          promises.push(
            db.Tag.find({where: {id: t}})
            .then(function(tag) {
              db.AdvertTag.create({cor_name: ''})
              .then(function(ad_tag) {
                ad_tag.setTag(tag)
                .then(function() {
                  ad_tag.setAdvert(ad)
                  .then(function() {
                    return;
                  })
                })
              })
            })
          )
        })
      } else if (tags.length == 1) {
        console.log("tags not an array, but a single element")
        promises.push(
          db.Tag.find({where: {id: tags}})
          .then(function(tag) {
            db.AdvertTag.create({cor_name: ''})
            .then(function(ad_tag) {
              ad_tag.setTag(tag)
              .then(function() {
                ad_tag.setAdvert(ad)
                .then(function() {
                  return;
                })
              })
            })
          })
        )
      }
    }
    if(typeof cities != "undefined") {
      if(cities.length > 1) {
        console.log("cities is an array")
        cities.forEach(function(c) {
          promises.push(
            db.City.find({where: {id: c}})
            .then(function(city) {
              db.AdvertCity.create({cor_name: ''})
              .then(function(ad_city) {
                ad_city.setCity(city)
                .then(function() {
                  ad_city.setAdvert(ad)
                  .then(function() {
                    return;
                  })
                })
              })
            })
          )
        })
      } else if (cities.length == 1) {
          console.log("cities is not an array; single element");
          promises.push(
            db.City.find({where: {id: cities}})
            .then(function(city) {
              db.AdvertCity.create({cor_name: ''})
              .then(function(ad_city) {
                ad_city.setCity(city)
                .then(function() {
                  ad_city.setAdvert(ad)
                  .then(function() {
                    return;
                  })
                })
              })
            })
          )
      }
    }
    if((typeof tags != "undefined") || (typeof cities != "undefined")) {
      return Promise.all(promises)
    }
  })
  .then(function(got) {
    res.send("Ad successfully created and associated with respective tags and cities" + JSON.stringify(got))
  })
}

// Get ads according to the passed query.
//TODO
/*
exports.get = function(req, res) {
  var tags= JSON.parse(req.query.tags);
  db.Advert.findAll({
    where: Sequelize.and(
      {campaign_end_date: {gt: new Date()}},
      {campaign_start_date: {lte: new Date()}}
    ),
    include: [{
      model: db.AdvertTag,
      include: [{
        model: db.Tag,
        where: {id: {in: tags}}
      }]
    }]
  })
  .then(function(ads_by_tag) {
    res.send(JSON.stringify(ads_by_tag))
  })
}
*/

exports.get = function(req, res) {
  db.Advert.findAll({
    where: Sequelize.and(
      {campaign_end_date: {gt: new Date()}},
      {campaign_start_date: {lte: new Date()}},
      {all: 1}
    )
  })
  .then(function(ads) {
    res.send(JSON.stringify(ads))
  })
}
