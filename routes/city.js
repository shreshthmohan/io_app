var db = require('../models');
var Sequelize = require('sequelize');

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

exports.retailer_list = function(req, res) {
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

// destroy city record
exports.destroy = function(req,res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    city.destroy().success(function(){
      res.redirect('/city/index');
    })
  })
};

// Individual retailer in city
exports.retailer = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Retailer.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {retailer_name: req.param('retailer_name')}
        )
      }
    )
    .success(function(retailer) {
      res.render('retailer', {
        retailer: retailer
      })
    })
  })
};
