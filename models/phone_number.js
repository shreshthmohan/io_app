module.exports = function(sequelize, DataTypes) {
  var PhoneNumber = sequelize.define('PhoneNumber',
  {
    number: {type: DataTypes.STRING(20), allowNull: false},
  },
  {
    associate: function(models) { // create association/foreign key constraint
      PhoneNumber.belongsTo(models.Retailer, {foreignKeyConstraint: true});
      // ^ will add FK to PhoneNumbers table
      PhoneNumber.belongsTo(models.Event, {foreignKeyConstraint: true});
      // ^ will add FK to PhoneNumbers table
    }    
  });

  return PhoneNumber;
};
