module.exports = function(sequelize, DataTypes) {
  var Retailer = sequelize.define('Retailer',
  {
    retailer_name:   {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:     {type: DataTypes.STRING(550)},
    address_field:   {type: DataTypes.STRING(170)},
    address_landmark:{type: DataTypes.STRING(50)},
    location_url:    {type: DataTypes.STRING(555)},
    phone_primary:   {type: DataTypes.STRING(20)},
    phone_secondary: {type: DataTypes.STRING(20)},
    phone_tertiary:  {type: DataTypes.STRING(20)},
    retailer_email:  {type: DataTypes.STRING(50)},
    comments:        {type: DataTypes.STRING(455)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Retailer.hasMany(models.GearTag, {foreignKeyConstraint: true});
      // ^ will add FK to GearTags table
      Retailer.hasMany(models.GearBrand, {foreignKeyConstraint: true});
      // ^ will add FK to GearBrand table
      Retailer.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Retailers table
      Retailer.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
    }
  });

  return Retailer;
};
