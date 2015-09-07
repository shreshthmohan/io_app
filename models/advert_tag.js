module.exports = function(sequelize, DataTypes) {
  var AdvertTag = sequelize.define('AdvertTag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      AdvertTag.belongsTo(models.Tag, {foreignKeyConstraint: true});
      // ^ will add FK to AdvertTags table
      AdvertTag.belongsTo(models.Advert, {foreignKeyConstraint: true});
      // ^ will add FK to AdvertTags table
    }
  });

  return AdvertTag;
};
