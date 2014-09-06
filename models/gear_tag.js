module.exports = function(sequelize, DataTypes) {
  var gear_tag = sequelize.define('gear_tag',
  {
    // nothing here! :-) Let's see if this works!
    cor_name: DataTypes.STRING
  },
  {
    associate: function(models) {
      gear_tag.belongsTo(models.tag, {foreignKeyConstraint: true});
      // ^ will add FK to gear_tags table
      gear_tag.belongsTo(models.gear_retailer, {foreignKeyConstraint: true});
      // ^ will add FK to gear_tags table
    }
  });

  return gear_tag;
};
