module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define('Tag',
  {
    tag_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      Tag.hasMany(models.EventTag, {foreignKeyConstraint: true});
      Tag.hasMany(models.GearTag, {foreignKeyConstraint: true});
    }
  });
  return Tag;
};
