module.exports = function(sequelize, DataTypes) {
  var School = sequelize.define('School',
  {
    school_name:          {type: DataTypes.STRING(60), allowNull: false}, 
    school_name_slug:     {type: DataTypes.STRING(60), allowNull: false}, 
    website_url:          {type: DataTypes.STRING(550)},
    img_url_square:       {type: DataTypes.STRING(555)},
    address_field:        {type: DataTypes.STRING(170)},
    location_url:         {type: DataTypes.STRING(555)},
    comments:             {type: DataTypes.STRING(455)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      School.hasMany(models.SchoolTag, {foreignKeyConstraint: true});
      // ^ will add FK to GearTags table
      School.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Schools table
      School.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
      School.hasMany(models.Email, {foreignKeyConstraint: true});
      // ^ will add FK to Emails  table
      School.hasMany(models.PhoneNumber, {foreignKeyConstraint: true});
      // ^ will add FK to PhoneNumbers table
    }
  });

  return School;
};
