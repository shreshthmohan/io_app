module.exports = function(sequelize, DataTypes) {
  var EventSubtag = sequelize.define('EventSubtag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      EventSubtag.belongsTo(models.Subtag, {foreignKeyConstraint: true});
      // ^ will add FK to EventTags table
      EventSubtag.belongsTo(models.Event, {foreignKeyConstraint: true});
      // ^ will add FK to EventTags table
    }
  });

  return EventSubtag;
};
