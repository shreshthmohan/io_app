var db = require('../../models');

exports.index = function(req, res) {
  db.City.findAll().success(function(cities){
    res.render('admin_index', {
      cities: cities
    })
  })
};

exports.error = function(req, res) {
  res.render('admin_error', {error: error})
}

exports.add_brand = function(req, res) {
  if(req.param('new_brand')) {
    db.Brand.create({
      brand_name: req.param('new_brand')
    })
    .success(function(brand) {
      res.redirect('/app/admin/add_brand')
    })
  } else {
    res.redirect('/app/admin/add_brand')
  }
};

exports.new_brand_form = function(req, res) {
  db.Brand.findAll().success(function(brands) {
    res.render('admin_add_brand', {
      brands: brands
    })
  })
};

// tags
exports.add_tag = function(req, res) {
  if(req.param('new_tag')) {
    db.Tag.create({
      tag_name: req.param('new_tag')
    })
    .success(function(tag) {
      res.redirect('/app/admin/add_tag')
    })
  } else {
    res.redirect('/app/admin/add_tag')
  }
};

exports.new_tag_form = function(req, res) {
  db.Tag.findAll().success(function(tags) {
    res.render('admin_add_tag', {
      tags: tags
    })
  })
};

// subtags
exports.add_subtag = function(req, res) {
  if(req.param('new_subtag')) {
    db.Subtag.create({
      subtag_name: req.param('new_subtag')
    })
    .success(function(subtag) {
      res.redirect('/app/admin/add_subtag')
    })
  } else {
    res.redirect('/app/admin/add_subtag')
  }
};

exports.new_subtag_form = function(req, res) {
  db.Subtag.findAll().success(function(subtags) {
    res.render('admin_add_subtag', {
      subtags: subtags
    })
  })
};
