module.exports = function(sequelize, DataTypes) {
  var gear_retailer = sequelize.define('gear_retailer',
  {
    retailer_name:   {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:     {type: DataTypes.STRING(50)},
    address_field:   {type: DataTypes.STRING(150)},
    address_landmark:{type: DataTypes.STRING(50)},
//    address_city_id {type: DataTypes.}, //FK: added via hasMany/belongsTo
    location_url:    {type: DataTypes.STRING(25)},
    facebook_url:    {type: DataTypes.STRING(25)},
    twitter_url:     {type: DataTypes.STRING(25)},
    instagram_url:   {type: DataTypes.STRING(25)},
    youtube_url:     {type: DataTypes.STRING(25)},
    available_brands:{type: DataTypes.STRING(150)},
    phone_primary:   {type: DataTypes.STRING(10)},
    phone_secondary: {type: DataTypes.STRING(10)},
    phone_tertiary:  {type: DataTypes.STRING(10)},
    retailer_email:  {type: DataTypes.STRING(40)},
    comments:        {type: DataTypes.STRING(255)}
  },
  {
    associate: function(models) { //create association/foreign key constraint
      gear_retailer.hasMany(models.gear_tag, {foreignKeyConstraint: true});
      // ^ will add FK to gear_tags table
      gear_retailer.belongsTo(models.indian_city, {foreignKeyConstraint: true});
      // ^ will add FK to gear_retailers table
    }
  });

  return gear_retailer;
};
