module.exports = function(sequelize, DataTypes) {
  var Subtag = sequelize.define('Subtag',
  {
    subtag_name: {type: DataTypes.STRING(30), allowNull: false}
  },
  {
    associate: function(models) {
    }
  });

  return Subtag;

};
