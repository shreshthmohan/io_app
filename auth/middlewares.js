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

// Not exactly auth middleware
// To make extra links avaialable to admin in some user views
exports.add_admin_bool = function(req, res, next) {
  if(req.user.type == 'admin') {
    res.locals.admin = true
    console.log('added admin = true to res.locals')
  }
  else {
    res.locals.admin = false
    console.log('added admin = false to res.locals')
  }
  next()
}
