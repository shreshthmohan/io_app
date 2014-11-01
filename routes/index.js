var db = require('../models');

exports.index = function(req, res) {
  db.City.findAll().success(function(cities){
    res.render('index', {
      cities: cities
    })
  })
};

exports.add_brand = function(req, res) {
  db.Brand.create({
    brand_name: req.param('new_brand')
  })
  .success(function(brand) {
    res.redirect('/add_brand')
  })
};

exports.new_brand_form = function(req, res) {
  res.render('add_brand')
};


exports.add_tag = function(req, res) {
  db.Tag.create({
    tag_name: req.param('new_tag')
  })
  .success(function(tag) {
    res.redirect('/add_tag')
  })
};

exports.new_tag_form = function(req, res) {
  res.render('add_tag')
};
