module.exports = function(sequelize, DataTypes) {
  var indian_city = sequelize.define('indian_city',
  {
    city_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      indian_city.hasMany(models.gear_retailer, {foreignKeyConstraint: true});
    }
    
  });

  return indian_city;
};
