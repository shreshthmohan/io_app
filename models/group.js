module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
    group_name:        {type: DataTypes.STRING(60), allowNull: false}, 
    group_name_slug:   {type: DataTypes.STRING(60), allowNull: false}, 
    img_url_square:    {type: DataTypes.STRING(555)},
    group_url:         {type: DataTypes.STRING(550)},// social link in all probability
    comments:          {type: DataTypes.STRING(455)}
  },
  {
    associate: function(models) {
      Group.hasMany(models.GroupTag, {foreignKeyConstraint: true});
      // ^ will add FK to GroupTags table
      Group.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Groups table
      Group.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
      Group.hasMany(models.Email, {foreignKeyConstraint: true});
      // ^ will add FK to Emails  table
      Group.hasMany(models.PhoneNumber, {foreignKeyConstraint: true});
      // ^ will add FK to PhoneNumbers table
    }
  });
  return Group;
}
