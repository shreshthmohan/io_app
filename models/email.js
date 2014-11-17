module.exports = function(sequelize, DataTypes) {
  var Email = sequelize.define('Email',
  {
    email: {type: DataTypes.STRING(50), allowNull: false},
    // facebook, twitter, instagram, flickr, youtube
    // google plus? pinterest?
  },
  {
    associate: function(models) { // create association/foreign key constraint
      Email.belongsTo(models.Retailer, {foreignKeyConstraint: true});
      // ^ will add FK to Emails table
      Email.belongsTo(models.Event, {foreignKeyConstraint: true});
      // ^ will add FK to Emails table
    }    
  });

  return Email;
};
