module.exports = function(sequelize, DataTypes) {
  var AdvertCity = sequelize.define('AdvertCity',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      AdvertCity.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to AdvertCitys table
      AdvertCity.belongsTo(models.Advert, {foreignKeyConstraint: true});
      // ^ will add FK to AdvertCitys table
    }
  });

  return AdvertCity;
};
