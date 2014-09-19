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

exports.retailers = function(req, res) {
  db.indian_city.find({ where: {city_name: req.param('city_name')}})
  .success(function(city) {
     db.gear_retailer.find({ where: {indian_cityId: city.id}})
     .success(function(retailers) {
        res.render('city_retailers', {
          city: city,
          retailers: retailers
        }) 
     })
  })
};
