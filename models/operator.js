module.exports = function(sequelize, DataTypes) {
  var Operator = sequelize.define('Operator',
  {
    operator_name:   {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:     {type: DataTypes.STRING(50)},
    address_field:   {type: DataTypes.STRING(170)},
    address_landmark:{type: DataTypes.STRING(50)},
    location_url:    {type: DataTypes.STRING(255)},
    phone_primary:   {type: DataTypes.STRING(20)},
    phone_secondary: {type: DataTypes.STRING(20)},
    phone_tertiary:  {type: DataTypes.STRING(20)},
    operator_email:  {type: DataTypes.STRING(50)},
    comments:        {type: DataTypes.STRING(255)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Operator.hasMany(models.ActivityTag, {foreignKeyConstraint: true});
      // ^ will add FK to ActivityTags table
      Operator.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Operators table
      Operator.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
    }
  });

  return Operator;
};
