exports.ensure_auth = function(req, res, next) {
  if(req.isAuthenticated()) {
    console.log('User is authenticated')
    next();
  }
  else {
    // TODO
    //req.flash('error', 'Please login first.')
    res.redirect('/sign_in')
  }
}
