module.exports = function(sequelize, DataTypes) {
  var City = sequelize.define('City',
  {
    city_name: {type: DataTypes.STRING(30), allowNull: false},
    image_url: {type: DataTypes.STRING(550)}
  },
  {
    associate: function(models) {
      City.hasMany(models.Retailer, {foreignKeyConstraint: true});
      City.hasMany(models.Event, {foreignKeyConstraint: true});
    }
    
  });

  return City;
};