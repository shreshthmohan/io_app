var db = require('../models');

exports.index = function(req, res) {
  db.City.findAll().success(function(cities){
    res.render('index', {
      cities: cities
    })
  })
};
