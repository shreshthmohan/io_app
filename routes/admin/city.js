var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion
var slugify = require('./slugify');

exports.create = function(req, res) {
  if(req.param('city_name')) {
    db.City.create({
      city_name: req.param('city_name'),
      city_name_slug: slugify(req.param('city_name')),
      image_url: req.param('image_url')
    })
    .success(function(city) {
      res.redirect('/app/admin/city/' + city.id)
    });
  } else {
    res.redirect('/app/admin/city_index')
  }
};

exports.index = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/create_city', {
      title: 'Indian Cities',
      cities: cities
    })
  });
};

// List of gear retailers in given city
exports.retailer_list = function(req, res) {
  db.City.find({where: {id: req.param('city_id')}})
  .then(function(city) {
    db.Retailer.findAll({
      where: {CityId: req.param('city_id')}
    })
    .success(function(retailers) {
      res.render('admin/city_retailers', {
        title: 'All gear retailers of ' + city.city_name,
        city: city,
        retailers: retailers
      }) 
    })
  })
};

// List of events in given city
exports.event_list = function(req, res) {
  db.City.find({ where: {id : req.param('city_id')}})
  .success(function(city) {
     db.Event.findAll({ where: {CityId: city.id}})
     .success(function(races) {
        res.render('admin/city_events', {
          title: 'All events of ' + city.city_name,
          city: city,
          races:races 
        }) 
     })
  })
};

// List of groups in given city
exports.group_list = function(req, res) {
  db.City.find({where: {id: req.param('city_id')}})
  .then(function(city) {
    db.Group.findAll({
      where: {CityId: req.param('city_id')}
    })
    .success(function(groups) {
      res.render('admin/city_groups', {
        title: 'All groups of ' + city.city_name,
        city: city,
        groups: groups
      }) 
    })
  })
};

// List of schools in given city
exports.school_list = function(req, res) {
  db.City.find({where: {id: req.param('city_id')}})
  .then(function(city) {
    db.School.findAll({
      where: {CityId: req.param('city_id')}
    })
    .success(function(schools) {
      res.render('admin/city_schools', {
        title: 'All schools of ' + city.city_name,
        city: city,
        schools: schools
      }) 
    })
  })
};
// Individual City
exports.individual = function(req, res) {
  db.City.findOne({where: {id: req.param('city_id')}})
  .then(function(city) {
    res.render('admin/city', {
      title: city.city_name,
      city: city})
  })
}

// destroy city record
exports.destroy = function(req,res) {
  db.City.find({where: {id: req.param('city_id')}})
  .success(function(city) {
    city.destroy().success(function(){
      res.redirect('/app/admin/city/index');
    })
  })
};

exports.modify_name = function(req, res) {
  db.City.find({where: {id: req.param('city_id')}})
  .then(function(city) {
    city.updateAttributes({
      city_name: req.param('new_city_name'),
      city_name_slug: slugify(req.param('new_city_name'))
    })
    .then(function(new_city) {
      res.redirect('/app/admin/city/' + new_city.id)
    })
  })
}

exports.modify_image_url = function(req, res) {
  db.City.find({where: {id: req.param('city_id')}})
  .then(function(city) {
    city.updateAttributes({
      image_url : req.param('new_image_url')
    })
    .then(function(new_city) {
      res.redirect('/app/admin/city/' + new_city.id)
    })
  })
}
