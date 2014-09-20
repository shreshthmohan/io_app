module.exports = function(sequelize, DataTypes) {
  var GearTag = sequelize.define('GearTag',
  {
    // nothing here! :-) Let's see if this works!
    cor_name: DataTypes.STRING
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
