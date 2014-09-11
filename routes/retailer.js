var db = require('../models');

exports.index = function(req, res) {
  db.indian_city.findAll().success(function(cities) {
    res.render('create_retailer', {
      title: 'Create new retailer',
      cities: cities
    })
  });
};
