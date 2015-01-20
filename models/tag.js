module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define('Tag',
  {
    tag_name: {type: DataTypes.STRING(30), allowNull: false},
    image_url: {type: DataTypes.STRING(550)}
  },
  {
    associate: function(models) {
      Tag.hasMany(models.EventTag, {foreignKeyConstraint: true});
      Tag.hasMany(models.GearTag, {foreignKeyConstraint: true});
      Tag.hasMany(models.GroupTag, {foreignKeyConstraint: true});
      Tag.hasMany(models.SchoolTag, {foreignKeyConstraint: true});
    }
  });
  return Tag;
};
