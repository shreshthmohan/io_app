module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
    group_name:        {type: DataTypes.STRING(60), allowNull: false}, 
    group_name_slug:   {type: DataTypes.STRING(60), allowNull: false}, 
    img_url_square:    {type: DataTypes.STRING(1000)},
    img_url_rect:      {type: DataTypes.STRING(1000)},
    group_url:         {type: DataTypes.STRING(550)},// social link in all probability
    comments:          {type: DataTypes.TEXT},
    maturity:          {type: DataTypes.STRING(25)}
  },
  {
    associate: function(models) {
      Group.hasMany(models.GroupTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to GroupTags table
      Group.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Groups table
      Group.hasMany(models.SocialLink, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to SocialLinks table
      Group.hasMany(models.Email, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to Emails  table
      Group.hasMany(models.PhoneNumber, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to PhoneNumbers table
    }
  });
  return Group;
}
