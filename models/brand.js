module.exports = function(sequelize, DataTypes) {
  var Brand = sequelize.define('Brand',
  {
    brand_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      Brand.hasMany(models.GearBrand, {foreignKeyConstraint: true});
      // ^ will add FK to GearBrands table
    }
  });

  return Brand;

};
