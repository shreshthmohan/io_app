var db = require('../models');

exports.create = function(req, res) {
  db.City.create({ city_name: req.param('city_name') })
    .success(function() {
      res.redirect('/city/index')
    });
};

exports.index = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('create_city', {
      title: 'Indian Cities',
      cities: cities
    })
  });
};

exports.retailers = function(req, res) {
  db.City.find({ where: {city_name: req.param('city_name')}})
  .success(function(city) {
     console.log(city.city_name);
     db.Retailer.find({ where: {indian_cityId: city.id}})
     .success(function(retailers) {
        res.render('city_retailers', {
          city: city,
          retailers: retailers
        }) 
     })
  })
};
