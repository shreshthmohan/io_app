module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define('Tag',
  {
    tag_name: {type: DataTypes.STRING(30), allowNull: false},
    tag_name_slug: {type: DataTypes.STRING(30), allowNull: false}, //TODO
    image_url: {type: DataTypes.STRING(1000)}
  },
  {
    associate: function(models) {
      Tag.hasMany(models.EventTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      Tag.hasMany(models.GearTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      Tag.hasMany(models.GroupTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      Tag.hasMany(models.SchoolTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
    }
  });
  return Tag;
};
