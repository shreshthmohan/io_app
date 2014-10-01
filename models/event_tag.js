module.exports = function(sequelize, DataTypes) {
  var EventTag = sequelize.define('EventTag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      EventTag.belongsTo(models.Tag, {foreignKeyConstraint: true});
      // ^ will add FK to EventTags table
      EventTag.belongsTo(models.Event, {foreignKeyConstraint: true});
      // ^ will add FK to EventTags table
    }
  });

  return EventTag;
};
