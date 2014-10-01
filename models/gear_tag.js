module.exports = function(sequelize, DataTypes) {
  var GearTag = sequelize.define('GearTag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      GearTag.belongsTo(models.Tag, {foreignKeyConstraint: true});
      // ^ will add FK to GearTags table
      GearTag.belongsTo(models.Retailer, {foreignKeyConstraint: true});
      // ^ will add FK to GearTags table
    }
  });

  return GearTag;
};
