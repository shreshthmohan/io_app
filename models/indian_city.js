module.exports = function(sequelize, DataTypes) {
  var City = sequelize.define('City',
  {
    city_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      City.hasMany(models.Retailer, {foreignKeyConstraint: true});
    }
    
  });

  return City;
};
