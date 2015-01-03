module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User',
  {
    email:         {type:DataTypes.STRING(60), allowNull: false},
    password_hash: {type:DataTypes.STRING, allowNull: false},
    name:          {type:DataTypes.STRING},
    type:          {type:DataTypes.STRING} // TODO allowNull: false
  });
  return User;
};
