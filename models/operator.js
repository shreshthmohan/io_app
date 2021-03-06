module.exports = function(sequelize, DataTypes) {
  var Operator = sequelize.define('Operator',
  {
    operator_name:   {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:     {type: DataTypes.STRING(50)},
    address_field:   {type: DataTypes.STRING(170)},
    location_url:    {type: DataTypes.STRING(255)},
    operator_email:  {type: DataTypes.STRING(50)},
    comments:        {type: DataTypes.TEXT}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Operator.hasMany(models.OperatorTag, {foreignKeyConstraint: true});
      // ^ will add FK to OperatorTags table
      Operator.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Operators table
      Operator.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
    }
  });

  return Operator;
};
