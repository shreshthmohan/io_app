var db = require('../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion

exports.index = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('create_retailer', {
      title: 'Create new retailer',
      cities: cities
    })
  });
};

// Create new retailer
exports.create = function(req, res) {
  db.City.find({ where: {id: req.param('city_id')}})
  .success(function(city) {
     db.Retailer.create({
       retailer_name:    req.param('retailer_name'),
       website_url:      req.param('website_url'),
       address_field:    req.param('address_field'),
       address_landmark: req.param('address_landmark'),
       location_url:     req.param('location_url'),
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

// Modify existing retailer, rather populate missing fields
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
        website_url:      req.param('website_url'),
        address_field:    req.param('address_field'),
        address_landmark: req.param('address_landmark'),
        location_url:     req.param('location_url'),
        phone_primary:    req.param('phone_primary'),
        phone_secondary:  req.param('phone_secondary'),
        phone_tertiary:   req.param('phone_tertiary'),
        retailer_email:   req.param('retailer_email'),
        comments:         req.param('comments')}
      ).success(function(retailer) {
         if(req.param('social_link')){
           db.SocialLink.create({
             link: req.param('social_link')
           }).success(function(slink) {
               slink.setRetailer(retailer).success(function() {
                 res.redirect('/gear/' + city.city_name + '/' +
                              retailer.retailer_name)
               })
             })
         }
         else {
           res.redirect('/gear/' + city.city_name + '/' +
                        retailer.retailer_name)
         }
       })
    })
  })
};

exports.cities = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('gear',
    {title: 'List of gear retailers by city',
     cities: cities});
  })
};

// Display individual retailer in city
// TODO: in the list of tags and brands that can be associated exclude linked
// ones by raw query using join
exports.individual = function(req, res) {
  db.City.find({where: {city_name: req.param('city_name')}})
  .success(function(city) {
    db.Retailer.find(
      {where: 
        Sequelize.and(
          {CityId: city.id},
          {retailer_name: req.param('retailer_name')}
        )
      } // eager loading for SocialLink doesn't seem to be working
        // waiting for resolution on github until then: workaround by using
        // another 'findAll where'
    )
    .success(function(retailer) {
      db.SocialLink.findAll({where: {RetailerID: retailer.id}})
      .success(function(slink) {
        // Select brands which are not associated with the said retailer
        sequelize.query('select * from Brands left outer join (select * from GearBrands where GearBrands.RetailerId = :retailerId) linkedBrands on Brands.id = linkedBrands.BrandId where linkedBrands.RetailerId is null', null, { raw: true }, { retailerId: retailer.id })
        .success(function(brands) {
          // Select tags which are not associated with the said retailer
          sequelize.query('select * from Tags left outer join (select * from GearTags where GearTags.RetailerId = :retailerId) linkedTags on Tags.id = linkedTags.TagId where linkedTags.RetailerId is null', null, { raw: true }, { retailerId: retailer.id })
          .success(function(tags) {
            sequelize.query('select * from GearBrands inner join Brands on GearBrands.BrandId = Brands.id where GearBrands.RetailerId = :retailerId', null, { raw: true }, {retailerId: retailer.id})
            .success(function(linked_brands) {
              sequelize.query('select * from GearTags inner join Tags on GearTags.TagId = Tags.id where GearTags.RetailerId = :retailerId', null, { raw: true }, {retailerId: retailer.id})
              .success(function(linked_tags) {
                res.render('retailer', {
                  retailer: retailer,
                  social_links: slink,
                  brands: brands,
                  linked_brands: linked_brands,
                  tags: tags,
                  linked_tags: linked_tags
                })
              })  
            })  
          })  
        })
      })
    })
  })
};


// Add new brand and associate it with a retailer
// After creating a new brand we need to associate that brand with correlation
// and retailer
// now since GearBrand belongsTo Brand and belongsTo Retailer
// we have GearBrand.setBrand and GearBrand.setRetailer
exports.add_brand = function(req, res) {
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
      db.Brand.create(
      {
        brand_name: req.param('new_brand')
      })
      .success(function(brand) {
        db.GearBrand.create({
          cor_name: ''
        })
        .success(function(gear_brand) {
          gear_brand.setRetailer(retailer).success(function() {
            gear_brand.setBrand(brand).success(function() {
              res.redirect('/gear/' + city.city_name + '/' +
                           retailer.retailer_name)
            })
          })
        })
      })
    })
  })
};

// Choose a brand from exisiting brands to be associated with retailer
exports.choose_brand = function(req, res) {
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
      db.GearBrand.create({
        cor_name: ''
      })
      .success(function(gear_brand) {
        db.Brand.find({where: {id: req.param('brand_id')}})
        .success(function(brand) {
          gear_brand.setRetailer(retailer).success(function() {
            gear_brand.setBrand(brand).success(function() {
              res.redirect('/gear/' + city.city_name + '/' +
                           retailer.retailer_name)
            })
          })
        })
      })
    })
  })
};

// Add a new tag and associate it with a retailer
exports.add_tag = function(req, res) {
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
      db.Tag.create(
      {
        tag_name: req.param('new_tag')
      })
      .success(function(tag) {
        db.GearTag.create({
          cor_name: ''
        })
        .success(function(gear_tag) {
          gear_tag.setRetailer(retailer).success(function() {
            gear_tag.setTag(tag).success(function() {
              res.redirect('/gear/' + city.city_name + '/' +
                           retailer.retailer_name)
            })
          })
        })
      })
    })
  })
};

// Choose a tag from exisiting tags to be associated with retailer
exports.choose_tag = function(req, res) {
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
      db.GearTag.create({
        cor_name: ''
      })
      .success(function(gear_tag) {
        db.Tag.find({where: {id: req.param('tag_id')}})
        .success(function(tag) {
          gear_tag.setRetailer(retailer).success(function() {
            gear_tag.setTag(tag).success(function() {
              res.redirect('/gear/' + city.city_name + '/' +
                           retailer.retailer_name)
            })
          })
        })
      })
    })
  })
};

// Just add a brand (and don't link it with a retailer just yet)
exports.add_tag_only = function(req, res) {
  db.Tag.create({
    tag_name: req.param('new_tag')
  })
  .success(function(tag) {
    res.redir
  })
};
