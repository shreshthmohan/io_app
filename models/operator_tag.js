module.exports = function(sequelize, DataTypes) {
  var OperatorTag = sequelize.define('OperatorTag',
  {
    cor_name: DataTypes.STRING
    // Unnecessary field TODO: check if things will work without any explicit
    // fields
  },
  {
    associate: function(models) {
      OperatorTag.belongsTo(models.Tag, {foreignKeyConstraint: true});
      // ^ will add FK to OperatorTags table
      OperatorTag.belongsTo(models.Operator, {foreignKeyConstraint: true});
      // ^ will add FK to OperatorTags table
    }
  });

  return OperatorTag;
};
