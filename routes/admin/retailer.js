var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion
var slugify = require('./slugify');

exports.create_form = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/create_retailer', {
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
       retailer_name_slug: slugify(req.param('retailer_name')),
       website_url:      req.param('website_url'),
       address_field:    req.param('address_field'),
       location_url:     req.param('location_url'),
       img_url_square:   req.param('img_url_square'),
       img_url_rect:    req.param('img_url_rect'),
       comments:         req.param('comments')
     }).success(function(retailer){
          retailer.setCity(city).success(function() { // adds FK in retailer
            res.redirect('/app/admin/gear/city/' + city.id);
          })
        })
   })
};

// Modify existing retailer, rather populate missing fields
exports.modify = function(req, res) {
  db.Retailer.find({
    where: {id: req.param('retailer_id')},
  })
  .success(function(retailer) {
    retailer.updateAttributes({
      website_url:      req.param('website_url'),
      address_field:    req.param('address_field'),
      location_url:     req.param('location_url'),
      img_url_square:   req.param('img_url_square'),
      img_url_rect:    req.param('img_url_rect'),
      maturity:         req.param('maturity'),
      comments:         req.param('comments')}
    ).success(function(retailer) {
       res.redirect('/app/admin/gear/retailer/' + retailer.id)
     })
  })
};

exports.modify_name = function(req, res) {
  db.Retailer.find({where: {id: req.param('retailer_id')}})
  .then(function(retailer) {
    retailer.updateAttributes({
      retailer_name: req.param('new_retailer_name'),
      retailer_name_slug: slugify(req.param('new_retailer_name'))
    })
    .then(function(retailer) {
      res.redirect('/app/admin/gear/retailer/' + retailer.id)
    })
  })
}

exports.modify_city = function(req, res) {
  db.Retailer.find({where: {id: req.param('retailer_id')}})
  .then(function(retailer) {
    db.City.find({where: {id: req.param('city_id')}})
    .then(function(city) {
      retailer.setCity(city)
      .then(function() {
        res.redirect('/app/admin/gear/retailer/' + retailer.id)
      })
    })
  })
}

exports.cities = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/gear',
    {title: 'List of gear retailers by city',
     cities: cities});
  })
};

// Display individual retailer in city
exports.individual = function(req, res) {
    db.Retailer.find({
      where: {id: req.param('retailer_id')},
      include: [db.City]
    })
    .success(function(retailer) {
      db.SocialLink.findAll({where: {RetailerId: retailer.id}})
      .success(function(slink) {
        // Select brands which are not associated with the said retailer
        // renamed columns because in the older query there were two "id"
        // columns which caused incorrect id to be selected in the 
        // options
        // Done the same for similar tags query
        // Hint: http://stackoverflow.com/questions/11978078/alias-a-column-name-on-a-left-join
        sequelize.query('select Brands.id as id, Brands.brand_name as brand_name, linkedBrands.id as linkedBrandsid, linkedBrands.BrandId as linkedBrandsBrandId, linkedBrands.RetailerId as linkedBrandsRetailerId from Brands left outer join (select * from GearBrands where GearBrands.RetailerId = :retailerId) linkedBrands on Brands.id = linkedBrands.BrandId where linkedBrands.RetailerId is null', null, { raw: true }, { retailerId: retailer.id })
        .success(function(brands) {
          // Select tags which are not associated with the said retailer
          sequelize.query('select Tags.id as id, Tags.tag_name as tag_name, linkedTags.id as linkedTagsid, linkedTags.TagId as linkedTagsTagId, linkedTags.RetailerId as linkedTagsRetailerId from Tags left outer join (select * from GearTags where GearTags.RetailerId = :retailerId) linkedTags on Tags.id = linkedTags.TagId where linkedTags.RetailerId is null', null, { raw: true }, { retailerId: retailer.id })
          .success(function(tags) {
            sequelize.query('select * from GearBrands inner join Brands on GearBrands.BrandId = Brands.id where GearBrands.RetailerId = :retailerId', null, { raw: true }, {retailerId: retailer.id})
            .success(function(linked_brands) {
              sequelize.query('select * from GearTags inner join Tags on GearTags.TagId = Tags.id where GearTags.RetailerId = :retailerId', null, { raw: true }, {retailerId: retailer.id})
              .success(function(linked_tags) {
                db.PhoneNumber.findAll({where: {RetailerId: retailer.id}})
                .success(function(numbers) {
                  db.Email.findAll({where: {RetailerId: retailer.id}})
                  .success(function(mails) {
                    db.City.findAll()
                    .then(function(cities) {
                      res.render('admin/retailer', {
                        title: retailer.retailer_name + ' in ' + retailer.City.city_name,
                        retailer: retailer,
                        social_links: slink,
                        brands: brands,
                        linked_brands: linked_brands,
                        numbers: numbers,
                        tags: tags,
                        cities: cities,
                        mails: mails,
                        linked_tags: linked_tags
                      })
                    })
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
// Add and if-else to prevent empty brand entries
// TODO: ^Add something on the front-end as well?
exports.add_brand = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
    }
  )
  .success(function(retailer) {
    if(req.param('new_brand')) { 
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
              res.redirect('/app/admin/gear/retailer/' + retailer.id)
            })
          })
        })
      })
    } else {
      res.redirect('/app/admin/gear/retailer/' + retailer.id)
    }
  })
};

// Choose a brand from exisiting brands to be associated with retailer
exports.choose_brand = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
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
            res.redirect('/app/admin/gear/retailer/' + retailer.id)
          })
        })
      })
    })
  })
};

// Add a new tag and associate it with a retailer
exports.add_tag = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
    }
  )
  .success(function(retailer) {
    if(req.param('new_tag')) {
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
              res.redirect('/app/admin/gear/retailer/' + retailer.id)
            })
          })
        })
      })
    } else {
      res.redirect('/app/admin/gear/retailer/' + retailer.id)
    }
  })
};

// Choose a tag from existing tags to be associated with retailer
exports.choose_tag = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
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
            res.redirect('/app/admin/gear/retailer/' + retailer.id)
          })
        })
      })
    })
  })
};

// Add a social link for the retailer
exports.add_slink = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
    }
  )
  .success(function(retailer) {
    if(req.param('social_link')){
      db.SocialLink.create({
        link: req.param('social_link')
      }).success(function(slink) {
          slink.setRetailer(retailer).success(function() {
            res.redirect('/app/admin/gear/retailer/' + retailer.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/gear/retailer/' + retailer.id)
    }
  })
};

// Add a phone number for the retailer
exports.add_phone = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
    }
  )
  .success(function(retailer) {
    if(req.param('phone_number')){
      db.PhoneNumber.create({
        number: req.param('phone_number')
      }).success(function(number) {
          number.setRetailer(retailer).success(function() {
            res.redirect('/app/admin/gear/retailer/' + retailer.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/gear/retailer/' + retailer.id)
    }
  })
};

// Add an email for the retailer
exports.add_email = function(req, res) {
  db.Retailer.find(
    {where: {id: req.param('retailer_id')}
    }
  )
  .success(function(retailer) {
    if(req.param('email')){
      db.Email.create({
        email: req.param('email')
      }).success(function(email) {
          email.setRetailer(retailer).success(function() {
            res.redirect('/app/admin/gear/retailer/' + retailer.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/gear/retailer/' + retailer.id)
    }
  })
};

exports.destroy_slink = function(req, res) {
  db.SocialLink.find({where: {id: req.param('slink_id')}})
  .success(function(slink) {
    slink.destroy().success(function() {
      res.redirect('/app/admin/gear/retailer/' + req.param('retailer_id'));
    })
  })
};

exports.destroy_number = function(req, res) {
  db.PhoneNumber.find({where: {id: req.param('number')}})
  .success(function(number) {
    number.destroy().success(function() {
      res.redirect('/app/admin/gear/retailer/' + req.param('retailer_id'));
    })
  })
};

exports.destroy_email = function(req, res) {
  db.Email.find({where: {id: req.param('email_id')}})
  .success(function(email) {
    email.destroy().success(function() {
      res.redirect('/app/admin/gear/retailer/' + req.param('retailer_id'));
    })
  })
};

exports.dissociate_tag = function(req, res) {
  db.GearTag.find({where: {id: req.param('tag_id')}})
  .success(function(tag) {
    tag.destroy().success(function() {
      res.redirect('/app/admin/gear/retailer/' + req.param('retailer_id'));
    })
  })
};

exports.dissociate_brand = function(req, res) {
  db.GearBrand.find({where: {id: req.param('brand_id')}})
  .success(function(brand) {
    brand.destroy().success(function() {
      res.redirect('/app/admin/gear/retailer/' + req.param('retailer_id'));
    })
  })
};
