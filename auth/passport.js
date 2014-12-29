var db = require('../models');
var commands = require('./commands')
var bcrypt = require('bcrypt');
var passport = require('passport');
var local_strategy = require('passport-local').Strategy;

var valid_password = function(user, password) {
  return bcrypt.compareSync(password, user.password_hash);
}

// verify callback for passport-local strategy instance
var verify_callback_local = function(email, password, done) {
  db.User.find({
    where: {email: email}
  })
  .success(function(user) {
    if(!user) {
      console.log("Wrong email: " + email);
      return done(null, false, {message: 'Wrong email'});
    }
    if(!valid_password(user, password)) {
      console.log("Wrong password" + password);
      return done(null, false, {message: 'Wrong passowrd'}); 
    }
    console.log("handing over user object to passport")
    return done(null, user);

  })
  .failure(function(err) {
    // assuming that this callback will executed when an *actual* error occurs
    console.log("some error occured while finding user")
    return done(err);
  })
}

// create instance of local strategy
var username_password_strat = new local_strategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  verify_callback_local
)



exports.init = function() {
  passport.use(username_password_strat);
  passport.serializeUser(commands.serialize_user());
  passport.deserializeUser(commands.deserialize_user());
  // remember to call corresponding app.use in *app.js after this call
}
