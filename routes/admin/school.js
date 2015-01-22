var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion
var slugify = require('./slugify');

exports.create_form = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/create_school', {
      title: 'Create new school',
      cities: cities
    })
  });
};

exports.cities = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/schools',
    {title: 'List of schools by city',
     cities: cities});
  })
}

// Create new school 
exports.create = function(req, res) {
  db.City.find({ where: {id: req.param('city_id')}})
  .success(function(city) {
     db.School.create({
       school_name:      req.param('school_name'),
       school_name_slug: slugify(req.param('school_name')),
       website_url:      req.param('website_url'),
       img_url_square:   req.param('img_url_square'),
       address_field:    req.param('address_field'),
       location_url:     req.param('location_url'),
       comments:         req.param('comments')
     }).success(function(school){
          school.setCity(city).success(function() { // adds FK in school
            res.redirect('/app/admin/schools/city/' + city.id);
          })
        })
   })
};

// Modify existing school, rather populate missing fields
exports.modify = function(req, res) {
  db.School.find({
    where: {id: req.param('school_id')},
  })
  .success(function(school) {
    school.updateAttributes({
      website_url:        req.param('website_url'),
      img_url_square:   req.param('img_url_square'),
      address_field:    req.param('address_field'),
      location_url:     req.param('location_url'),
      comments:         req.param('comments')
    }).success(function(school) {
       res.redirect('/app/admin/schools/' + school.id)
     })
  })
};

exports.modify_name = function(req, res) {
  db.School.find({where: {id: req.param('school_id')}})
  .then(function(school) {
    school.updateAttributes({
      school_name: req.param('new_school_name'),
      school_name_slug: slugify(req.param('new_school_name'))
    })
    .then(function(school) {
      res.redirect('/app/admin/schools/' + school.id)
    })
  })
}

exports.individual = function(req, res) {
  db.School.find({
    where: {id: req.param('school_id')},
    include: [
      db.City,
      db.Email,
      db.PhoneNumber,
      db.SocialLink,
      {
        model: db.SchoolTag,
        include: [db.Tag]
      }
    ]
  })
  .then(function(school) {
    db.Tag.findAll( // This is a little weird, will give extra tags
                     // but works; Alternative is raw query. TODO
    )
    .then(function(tags) {
      res.render('admin/school', {
        title: school.school_name + ' in ' + school.City.city_name,
        school: school,
        tags: tags
      })
    })
  })
}

// Add a new tag and associate it with a school
exports.add_tag = function(req, res) {
  db.School.find(
    {where: {id: req.param('school_id')}
    }
  )
  .success(function(school) {
    if(req.param('new_tag')) {
      db.Tag.create(
      {
        tag_name: req.param('new_tag')
      })
      .success(function(tag) {
        db.SchoolTag.create({
          cor_name: ''
        })
        .success(function(school_tag) {
          school_tag.setSchool(school).success(function() {
            school_tag.setTag(tag).success(function() {
              res.redirect('/app/admin/schools/' + school.id)
            })
          })
        })
      })
    } else {
      res.redirect('/app/admin/schools/' + school.id)
    }
  })
};

// Choose a tag from existing tags to be associated with school
exports.choose_tag = function(req, res) {
  db.School.find(
    {where: {id: req.param('school_id')}
    }
  )
  .success(function(school) {
    db.SchoolTag.create({
      cor_name: ''
    })
    .success(function(school_tag) {
      db.Tag.find({where: {id: req.param('tag_id')}})
      .success(function(tag) {
        school_tag.setSchool(school).success(function() {
          school_tag.setTag(tag).success(function() {
            res.redirect('/app/admin/schools/' + school.id)
          })
        })
      })
    })
  })
};

// Add a social link for the school
exports.add_slink = function(req, res) {
  db.School.find(
    {where: {id: req.param('school_id')}
    }
  )
  .success(function(school) {
    if(req.param('social_link')){
      db.SocialLink.create({
        link: req.param('social_link')
      }).success(function(slink) {
          slink.setSchool(school).success(function() {
            res.redirect('/app/admin/schools/' + school.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/schools/' + school.id)
    }
  })
};

// Add a phone number for the school
exports.add_phone = function(req, res) {
  db.School.find(
    {where: {id: req.param('school_id')}
    }
  )
  .success(function(school) {
    if(req.param('phone_number')){
      db.PhoneNumber.create({
        number: req.param('phone_number')
      }).success(function(number) {
          number.setSchool(school).success(function() {
            res.redirect('/app/admin/schools/' + school.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/schools/' + school.id)
    }
  })
};

// Add an email for the school
exports.add_email = function(req, res) {
  db.School.find(
    {where: {id: req.param('school_id')}
    }
  )
  .success(function(school) {
    if(req.param('email')){
      db.Email.create({
        email: req.param('email')
      }).success(function(email) {
          email.setSchool(school).success(function() {
            res.redirect('/app/admin/schools/' + school.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/schools/' + school.id)
    }
  })
};

exports.destroy_slink = function(req, res) {
  db.SocialLink.find({where: {id: req.param('slink_id')}})
  .success(function(slink) {
    slink.destroy().success(function() {
      res.redirect('/app/admin/schools/' + req.param('school_id'));
    })
  })
};

exports.destroy_number = function(req, res) {
  db.PhoneNumber.find({where: {id: req.param('number')}})
  .success(function(number) {
    number.destroy().success(function() {
      res.redirect('/app/admin/schools/' + req.param('school_id'));
    })
  })
};

exports.destroy_email = function(req, res) {
  db.Email.find({where: {id: req.param('email_id')}})
  .success(function(email) {
    email.destroy().success(function() {
      res.redirect('/app/admin/schools/' + req.param('school_id'));
    })
  })
};

exports.dissociate_tag = function(req, res) {
  db.SchoolTag.find({where: {TagId: req.param('tag_id')}})
  .success(function(tag) {
    tag.destroy().success(function() {
      res.redirect('/app/admin/schools/' + req.param('school_id'));
    })
  })
};
