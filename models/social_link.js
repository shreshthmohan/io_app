module.exports = function(sequelize, DataTypes) {
  var SocialLink = sequelize.define('SocialLink',
  {
    link: {type: DataTypes.STRING(), allowNull: false},
    // facebook, twitter, instagram, flickr, youtube
    // google plus? pinterest?
  },
  {
    associate: function(models) { // create association/foreign key constraint
      SocialLink.belongsTo(models.Retailer, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
      SocialLink.belongsTo(models.Event, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
      SocialLink.belongsTo(models.Group, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
      SocialLink.belongsTo(models.School, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
    }    
  });

  return SocialLink;
};
