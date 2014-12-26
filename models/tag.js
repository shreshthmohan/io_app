module.exports = function(sequelize, DataTypes) {
  var Tag = sequelize.define('Tag',
  {
    tag_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
      Tag.hasMany(models.Event, {foreignKeyConstraint: true});
      Tag.hasMany(models.Retailer, {foreignKeyConstraint: true});
    }
  });

  return Tag;

};
