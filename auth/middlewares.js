exports.ensure_auth = function(req, res, next) {
  if(req.isAuthenticated()) {
    console.log('User is authenticated')
    next();
  }
  else {
    // TODO
    //req.flash('error', 'Please login.')
    res.redirect('/sign_in')
  }
}

exports.ensure_admin = function(req, res, next) {
  if(req.user.type == 'admin') {
    console.log("Admin here!");
    next();
  }
  else {
    res.redirect('/')
  }
}
