var db = require('../../models');

exports.index = function(req, res) {
  res.render('index', {
    title: 'User Home' 
  })
}

exports.index_exp = function(req, res) {
  res.render('index_exp', {
    title: 'India Outside' 
  })
}
