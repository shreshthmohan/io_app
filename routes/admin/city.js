var db = require('../../models');
var Sequelize = require('sequelize');

exports.create = function(req, res) {
  if(req.param('city_name')) {
    db.City.create({ city_name: req.param('city_name') })
      .success(function() {
        res.redirect('/app/admin/city/index')
      });
  } else {
    res.redirect('/app/admin/city/index')
  }
};

exports.index = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin_create_city', {
      title: 'Indian Cities',
      cities: cities
    })
  });
};

// List of gear retailers in given city
exports.retailer_list = function(req, res) {
  db.City.find({ where: {city_name: req.param('city_name')}})
  .success(function(city) {
     db.Retailer.findAll({ where: {CityId: city.id}})
     .success(function(retailers) {
        console.log(JSON.stringify(retailers))
        res.render('admin_city_retailers', {
          city: city,
          retailers: retailers
        }) 
     })
  })
};

// List of events in given city
exports.event_list = function(req, res) {
  db.City.find({ where: {city_name: req.param('city_name')}})
  .success(function(city) {
     db.Event.findAll({ where: {CityId: city.id}})
     .success(function(races) {
        res.render('admin_city_events', {
          city: city,
          races:races 
        }) 
     })
  })
};

// destroy city record
exports.destroy = function(req,res) {
  db.City.find({where: {id: req.param('city_id')}})
  .success(function(city) {
    city.destroy().success(function(){
      res.redirect('/app/admin/city/index');
    })
  })
};
