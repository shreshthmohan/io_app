var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion

// Note: tag and activity have been used interchangeably

// 4 possibilities
// location : all, tag: all
// location : chosen, tag: all
// location : all, tag: chosen 
// location : chosen, tag: chosen 

// All locations all tags
// But isn't this relatively useless?
all_loc_all_tags = function(req, res ) {
  db.Retailer.findAll({
    attributes: [
      'id',
      'retailer_name'],
    include: [
      db.City, 
      {
        model: db.GearTag,
        include: [db.Tag]
      }]
  })
  .success(function(retailers) {
    db.City.findAll()
    .success(function(cities) {
      db.Tag.findAll()
      .success(function(tags) {
        res.render('user/gear', {
          title_: 'All Gear Retailers',
          retailers: retailers,
          cities: cities,
          tags: tags
        })
      })
    })
  })
}

// Chosen location all tags
chosen_loc_all_tags = function(req, res) {
  db.Retailer.findAll({
    attributes: [
      'id',
      'retailer_name'],
    include: [
      db.City,
      {
        model: db.GearTag,
        include: [db.Tag]
      }],
    where: ["CityId = " + req.param('location')]
  })
  .success(function(retailers) {
    db.City.find({where: {id: req.param('location')}})
    .success(function(city) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/gear', {
            title_: 'All Gear Retailers in ' + city.city_name,
            retailers: retailers,
            cities: cities,
            tags: tags
          })
        })
      })
    })
  })
}

// All locations chosen tag
all_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    console.log('all loc chosen tag, tag found')
    db.GearTag.findAll({
      where: ["TagId = " + tag.id],
      include: [
        {
          model: db.Retailer,
          attributes: [
            'id',
            'retailer_name'
          ],
          include: [db.City]
        }],
      raw: true
    })
    .success(function(gear_tags) {
      db.City.findAll()
      .success(function(cities) {
        db.Tag.findAll()
        .success(function(tags) {
          res.render('user/gear', {
            title_: 'All ' + tag.tag_name + ' Gear Retailers',
            tag: tag, // chosen tag
            gear_tags: gear_tags, // these contain retailers to be displayed
            cities: cities,
            tags: tags // all tags for filter bar
          })
        })
      })
    })
  })
}

// Chosen location chosen tag
chosen_loc_chosen_tag = function(req, res) {
  db.Tag.find({
    where: {id: req.param('activity')}
  })
  .success(function(tag) {
    db.GearTag.findAll({
      where: ['TagId= ' + tag.id],
      include: [{
          model: db.Retailer,
          where: ["CityId = " + req.param('location')],
          include: [db.City]
        }],
      attributes: [
        'id',
        'retailer_name'
      ]
    })
    .success(function(gear_tags) {
      db.City.find({where: {id: req.param('location')}})
      .success(function(city) {
        db.City.findAll()
        .success(function(cities) {
          db.Tag.findAll()
          .success(function(tags) {
            res.render('user/gear', {
              title_: 'All ' + tag.tag_name + ' Gear Retailers in ' + city.city_name,
              tag: tag,
              gear_tags: gear_tags,
              cities: cities,
              tags: tags
            })
          })
        })
      })
    })
  })
}

// Routing for list of gear retailers
exports.all = function(req, res) {
  var tag = req.param('activity');
  var loc = req.param('location');
  // All locations and all activities
  if((loc == 0 || loc == null) && (tag == 0 || tag == null)) { 
    all_loc_all_tags(req, res )
  }
  // All locations and a chosen activity
  else if (loc == 0) {
    all_loc_chosen_tag(req, res)
  }
  // All activities for a chosen location
  else if (tag == 0) {
    chosen_loc_all_tags(req, res)
  }
  // Chosen activities for a chosen location
  else {
    chosen_loc_chosen_tag(req, res)
  }
}

// Individual retailers
exports.individual = function(req, res) {
  db.Retailer.find({
    where: {id: req.param('retailer_id')},
    include: [ 
      db.City,
      db.Email,
      db.SocialLink,
      db.PhoneNumber,
      {
        model: db.GearTag,
        include: [db.Tag]}
      ],
    attributes: [
      'id',
      'retailer_name',
      'website_url',
      'location_url',
      'address_field',
      'comments']
  })
  .success(function(retailer) {
     res.render('user/individual_retailer', {
       title_: retailer.retailer_name + ' in ' + retailer_name.City.city_name,
       retailer: retailer}) 
  }) 
}
