var db = require('../../models');
var Promise = require('bluebird');

/*
exports.index = function(req, res) {
  db.City.findAll()
  .success(function(cities) {
    db.Tag.findAll()
    .success(function(tags) {
      res.render('user/index', {
        title: 'India Outside',
        cities: cities,
        tags: tags
      })
    })
  })
}
*/
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
          })
        ])
        .spread(function(event_count, retailer_count) {
          tag = t.toJSON();
          tag.event_count = event_count;
          tag.retailer_count = retailer_count;
          return tag
        })
      )
    })
    return Promise.all(promises);
  })
  .then(function(tags_c) {
    db.City.findAll()
    .then(function(cities) {
      res.render('user/index', {
        title_: 'Adventure Outdoors India - Running, Cycling, Trekking, Surfing, Kayaking, Rafting & More ',
        cities: cities,
        tags: tags_c
      })
    })
  })
}
