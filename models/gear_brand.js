module.exports = function(sequelize, DataTypes) {
  var GearBrand = sequelize.define('GearBrand',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      GearBrand.belongsTo(models.Brand, {foreignKeyConstraint: true});
      // ^ will add FK to GearBrands table
      GearBrand.belongsTo(models.Retailer, {foreignKeyConstraint: true});
      // ^ will add FK to GearBrands table
    }
  });

  return GearBrand;
};
