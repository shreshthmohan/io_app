module.exports = function(sequelize, DataTypes) {
  var tag = sequelize.define('tag',
  {
    tag_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      tag.hasMany(models.gear_tag, {foreignKeyConstraint: true});
      // ^ will add FK to gear_tags table
    }
  });

  return tag;

};
