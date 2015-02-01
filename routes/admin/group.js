var db = require('../../models');
var Sequelize = require('sequelize');
var sequelize = db.sequelize; // just to avoid the confusion
var slugify = require('./slugify');

exports.create_form = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/create_group', {
      title: 'Create new group',
      cities: cities
    })
  });
};

exports.cities = function(req, res) {
  db.City.findAll().success(function(cities) {
    res.render('admin/groups',
    {title: 'List of groups by city',
     cities: cities});
  })
}

// Create new group 
exports.create = function(req, res) {
  db.City.find({ where: {id: req.param('city_id')}})
  .success(function(city) {
     db.Group.create({
       group_name:       req.param('group_name'),
       group_name_slug:  slugify(req.param('group_name')),
       group_url:        req.param('group_url'),
       img_url_square:   req.param('img_url_square'),
       comments:         req.param('comments')
     }).success(function(group){
          group.setCity(city).success(function() { // adds FK in group
            res.redirect('/app/admin/groups/city/' + city.id);
          })
        })
   })
};

// Modify existing group, rather populate missing fields
exports.modify = function(req, res) {
  db.Group.find({
    where: {id: req.param('group_id')},
  })
  .success(function(group) {
    group.updateAttributes({
      group_url:        req.param('group_url'),
      img_url_square:   req.param('img_url_square'),
      comments:         req.param('comments')
    }).success(function(group) {
       res.redirect('/app/admin/groups/' + group.id)
     })
  })
};

exports.modify_name = function(req, res) {
  db.Group.find({where: {id: req.param('group_id')}})
  .then(function(group) {
    group.updateAttributes({
      group_name: req.param('new_group_name'),
      group_name_slug: slugify(req.param('new_group_name'))
    })
    .then(function(group) {
      res.redirect('/app/admin/groups/' + group.id)
    })
  })
}

exports.individual = function(req, res) {
  db.Group.find({
    where: {id: req.param('group_id')},
    include: [
      db.City,
      db.Email,
      db.PhoneNumber,
      db.SocialLink,
      {
        model: db.GroupTag,
        include: [db.Tag]
      }
    ]
  })
  .then(function(group) {
    db.Tag.findAll( // This is a little weird, will give extra tags
                     // but works; Alternative is raw query. TODO
    )
    .then(function(tags) {
      res.render('admin/group', {
        title: group.group_name + ' in ' + group.City.city_name,
        group: group,
        tags: tags
      })
    })
  })
}

// Add a new tag and associate it with a group
exports.add_tag = function(req, res) {
  db.Group.find(
    {where: {id: req.param('group_id')}
    }
  )
  .success(function(group) {
    if(req.param('new_tag')) {
      db.Tag.create(
      {
        tag_name: req.param('new_tag')
      })
      .success(function(tag) {
        db.GroupTag.create({
          cor_name: ''
        })
        .success(function(group_tag) {
          group_tag.setGroup(group).success(function() {
            group_tag.setTag(tag).success(function() {
              res.redirect('/app/admin/groups/' + group.id)
            })
          })
        })
      })
    } else {
      res.redirect('/app/admin/groups/' + group.id)
    }
  })
};

// Choose a tag from existing tags to be associated with group
exports.choose_tag = function(req, res) {
  db.Group.find(
    {where: {id: req.param('group_id')}
    }
  )
  .success(function(group) {
    db.GroupTag.create({
      cor_name: ''
    })
    .success(function(group_tag) {
      db.Tag.find({where: {id: req.param('tag_id')}})
      .success(function(tag) {
        group_tag.setGroup(group).success(function() {
          group_tag.setTag(tag).success(function() {
            res.redirect('/app/admin/groups/' + group.id)
          })
        })
      })
    })
  })
};

// Add a social link for the group
exports.add_slink = function(req, res) {
  db.Group.find(
    {where: {id: req.param('group_id')}
    }
  )
  .success(function(group) {
    if(req.param('social_link')){
      db.SocialLink.create({
        link: req.param('social_link')
      }).success(function(slink) {
          slink.setGroup(group).success(function() {
            res.redirect('/app/admin/groups/' + group.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/groups/' + group.id)
    }
  })
};

// Add a phone number for the group
exports.add_phone = function(req, res) {
  db.Group.find(
    {where: {id: req.param('group_id')}
    }
  )
  .success(function(group) {
    if(req.param('phone_number')){
      db.PhoneNumber.create({
        number: req.param('phone_number')
      }).success(function(number) {
          number.setGroup(group).success(function() {
            res.redirect('/app/admin/groups/' + group.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/groups/' + group.id)
    }
  })
};

// Add an email for the group
exports.add_email = function(req, res) {
  db.Group.find(
    {where: {id: req.param('group_id')}
    }
  )
  .success(function(group) {
    if(req.param('email')){
      db.Email.create({
        email: req.param('email')
      }).success(function(email) {
          email.setGroup(group).success(function() {
            res.redirect('/app/admin/groups/' + group.id)
          })
        })
    }
    else {
      res.redirect('/app/admin/groups/' + group.id)
    }
  })
};

exports.destroy_slink = function(req, res) {
  db.SocialLink.find({where: {id: req.param('slink_id')}})
  .success(function(slink) {
    slink.destroy().success(function() {
      res.redirect('/app/admin/groups/' + req.param('group_id'));
    })
  })
};

exports.destroy_number = function(req, res) {
  db.PhoneNumber.find({where: {id: req.param('number')}})
  .success(function(number) {
    number.destroy().success(function() {
      res.redirect('/app/admin/groups/' + req.param('group_id'));
    })
  })
};

exports.destroy_email = function(req, res) {
  db.Email.find({where: {id: req.param('email_id')}})
  .success(function(email) {
    email.destroy().success(function() {
      res.redirect('/app/admin/groups/' + req.param('group_id'));
    })
  })
};

exports.dissociate_tag = function(req, res) {
  db.GroupTag.find({where: {TagId: req.param('tag_id')}})
  .success(function(tag) {
    tag.destroy().success(function() {
      res.redirect('/app/admin/groups/' + req.param('group_id'));
    })
  })
};
