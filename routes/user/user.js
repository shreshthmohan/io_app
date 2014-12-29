var db = require('../../models');
var Sequelize = db.Sequelize;
var sequelize = db.sequelize; // just to avoid the confusion
var bcrypt = require('bcrypt');

exports.sign_up_form = function(req, res) {
  res.render('sign_up');
}

exports.sign_in_form = function(req, res) {
  res.render('sign_in');
}

// to hash a password synchronously
// TODO: change to async?
exports.create_hash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

exports.sign_up = function(req, res) {
  db.User.create({
    email: req.param('email'),
    password_hash: exports.create_hash(req.param('password')),
    name: req.param('name')
  })
  .success(function() {
    res.redirect('/');
  })
  // TODO: figure out what to do in case of error
}
// TODO: user type admin/normal

