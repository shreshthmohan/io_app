var db = require('../models');
var Sequelize = require('sequelize');

exports.index = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('create_retailer', {
      title: 'Create new retailer',
      cities: cities
    })
  });
};

exports.create = function(req, res) {
  db.City.find({ where: {id: req.param('city_id')}})
  .success(function(city) {
     db.Retailer.create({
       retailer_name:    req.param('retailer_name'),
       website_url:      req.param('website_url'),
       address_field:    req.param('address_field'),
       address_landmark: req.param('address_landmark'),
       location_url:     req.param('location_url'),
       facebook_url:     req.param('facebook_url'),
       twitter_url:      req.param('twitter_url'),
       instagram_url:    req.param('instagram_url'),
       youtube_url:      req.param('youtube_url'),
       available_brands: req.param('available_brands'),
       phone_primary:    req.param('phone_primary'),
       phone_secondary:  req.param('phone_secondary'),
       phone_tertiary:   req.param('phone_tertiary'),
       retailer_email:   req.param('retailer_email'),
       comments:         req.param('comments')
     }).success(function(retailer){
          //city.addRetailer(retailer).success(function() { // adds FK in retailer ?
          retailer.setCity(city).success(function() { // adds FK in retailer ?
            res.redirect('/gear/' + city.city_name);
          })
        })
   })
};


exports.modify = function(req, res) {
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
      retailer.updateAttributes({
        phone_primary:   req.param('phone_primary'),
        phone_secondary: req.param('phone_secondary'),
        phone_tertiary:  req.param('phone_tertiary'),
        retailer_email:  req.param('retailer_email'),
        comments:        req.param('comments')}
      ).success(function(retailer) {
         res.redirect('/gear/' + city.city_name + '/' + retailer.retailer_name)
      })
    })
   })
};
