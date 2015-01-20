module.exports = function(sequelize, DataTypes) {
  var GroupTag = sequelize.define('GroupTag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      GroupTag.belongsTo(models.Tag, {foreignKeyConstraint: true});
      // ^ will add FK to GroupTags table
      GroupTag.belongsTo(models.Group, {foreignKeyConstraint: true});
      // ^ will add FK to GroupTags table
    }
  });

  return GroupTag;
};
