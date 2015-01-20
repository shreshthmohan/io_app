module.exports = function(sequelize, DataTypes) {
  var SchoolTag = sequelize.define('SchoolTag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      SchoolTag.belongsTo(models.Tag, {foreignKeyConstraint: true});
      // ^ will add FK to SchoolTags table
      SchoolTag.belongsTo(models.School, {foreignKeyConstraint: true});
      // ^ will add FK to SchoolTags table
    }
  });

  return SchoolTag;
};
