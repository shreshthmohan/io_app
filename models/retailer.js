module.exports = function(sequelize, DataTypes) {
  var Retailer = sequelize.define('Retailer',
  {
    retailer_name:        {type: DataTypes.STRING(60), allowNull: false}, 
    retailer_name_slug:   {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:          {type: DataTypes.STRING(550)},
    img_url_square:       {type: DataTypes.STRING(555)},
    address_field:        {type: DataTypes.STRING(170)},
    location_url:         {type: DataTypes.STRING(555)},
    comments:             {type: DataTypes.STRING(455)}
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
      Retailer.hasMany(models.Email, {foreignKeyConstraint: true});
      // ^ will add FK to Emails  table
      Retailer.hasMany(models.PhoneNumber, {foreignKeyConstraint: true});
      // ^ will add FK to PhoneNumbers table
    }
  });

  return Retailer;
};


// Name
// City
// Address
// Map URL
// Numbers
// Web URL, if any
// Comments:
//   Days open, timings
//   Other things, parking? play-field? 

