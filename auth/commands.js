var db = require('../models');

exports.serialize_user = function() {
  return function _serialize_user(user, callback) {
    console.log('serializing user')
    callback(null, {'type': 'user',
                    'id': user.id})
  }
}

exports.deserialize_user = function() {
  return function _deserialize_user(obj, callback) {
    db.User.find({where: {id: obj.id}})
    .success(function(user){
      console.log('deserializing user')
      callback(null, user);
    })
    .failure(function(error) {
      console.log('some error while deserializing user')
      callback(error);
    })
  }
}
