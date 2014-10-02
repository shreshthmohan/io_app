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
     db.Retailer.findAll({ where: {CityId: city.id}})
     .success(function(retailers) {
        console.log("before printing retailers");
        console.log(retailers);
        console.log("after printing retailers");
        res.render('city_retailers', {
          city: city,
          retailers: retailers
        }) 
     })
  })
};

exports.destroy = function(req,res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    city.destroy().success(function(){
      res.redirect('/city/index');
    })
  })
};
