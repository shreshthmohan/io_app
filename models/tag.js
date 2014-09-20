module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define('Tag',
  {
    tag_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      Tag.hasMany(models.GearTag, {foreignKeyConstraint: true});
      // ^ will add FK to GearTags table
    }
  });

  return Tag;

};
