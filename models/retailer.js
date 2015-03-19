module.exports = function(sequelize, DataTypes) {
  var Retailer = sequelize.define('Retailer',
  {
    retailer_name:        {type: DataTypes.STRING(60), allowNull: false}, 
    retailer_name_slug:   {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:          {type: DataTypes.STRING(550)},
    img_url_square:       {type: DataTypes.STRING(555)},
    address_field:        {type: DataTypes.STRING(170)},
    location_url:         {type: DataTypes.STRING(555)},
    comments:             {type: DataTypes.TEXT},
    maturity:             {type: DataTypes.STRING(25)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Retailer.hasMany(models.GearTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to GearTags table
      Retailer.hasMany(models.GearBrand, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to GearBrand table
      Retailer.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Retailers table
      Retailer.hasMany(models.SocialLink, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to SocialLinks table
      Retailer.hasMany(models.Email, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to Emails  table
      Retailer.hasMany(models.PhoneNumber, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
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

