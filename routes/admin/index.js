var db = require('../../models');

exports.index = function(req, res) {
  db.City.findAll().success(function(cities){
    res.render('admin/index', {
      title: 'All admin links | India Outside',
      cities: cities
    })
  })
};

exports.error = function(req, res) {
  res.render('admin/error', {
    title: 'Some erorr occurred',
    error: error})
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
    res.render('admin/add_brand', {
      title: 'Add a gear brand',
      brands: brands
    })
  })
};

// tags
exports.add_tag = function(req, res) {
  if(req.param('new_tag')) {
    db.Tag.create({
      tag_name:  req.param('new_tag'),
      image_url: req.param('new_tag_image_url')
    })
    .success(function(tag) {
      res.redirect('/app/admin/add_tag')
    })
  } else {
    res.redirect('/app/admin/add_tag')
  }
};

// Individual tag
exports.individual_tag = function(req, res) {
  db.Tag.find({where: {id: req.param('tag_id')}})
  .success(function(tag) {
    res.render('admin/tag', {
      title: tag.tag_name + ' tag',
      tag: tag
    })
  })
}

// Modify tag name
exports.modify_tag_name = function(req, res) {
  db.Tag.find({where: {id: req.param('tag_id')}})
  .success(function(tag) {
    tag.updateAttributes({
      tag_name: req.param('new_tag_name')
    })
    .success(function(new_tag) {
      res.redirect('/app/admin/tag/' + new_tag.id)
    })
  })
}

// Modify tag image URL
exports.modify_tag_image_url = function(req, res) {
  db.Tag.find({where: {id: req.param('tag_id')}})
  .success(function(tag) {
    tag.updateAttributes({
      image_url: req.param('new_image_url')
    })
    .success(function(new_tag) {
      res.redirect('/app/admin/tag/' + new_tag.id)
    })
  })
}
exports.new_tag_form = function(req, res) {
  db.Tag.findAll().success(function(tags) {
    res.render('admin/add_tag', {
      title: 'Add a tag',
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
    res.render('admin/add_subtag', {
      title: 'Add a subtag',
      subtags: subtags
    })
  })
};
