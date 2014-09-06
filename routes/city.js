var db = require('../models');

exports.create = function(req, res) {
  db.indian_city.create({ city_name: req.param('city_name') })
    .success(function() {
      res.redirect('/city/index')
    });
};

exports.index = function(req, res) {
  db.indian_city.findAll().success(function(cities) {
    res.render('create_city', {
      title: 'Indian Cities',
      cities: cities
    })
  });
};
