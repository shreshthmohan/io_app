var db = require('../../models');

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
