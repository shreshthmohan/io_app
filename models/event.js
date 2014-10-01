module.exports = function(sequelize, DataTypes) {
  var Event = sequelize.define('Event',
  {
    event_name:      {type: DataTypes.STRING(60), allowNull: false}, 
    event_url:       {type: DataTypes.STRING(150)},
    event_url_social:{type: DataTypes.STRING(150)},
    organiser_name:  {type: DataTypes.STRING(50)},
    organiser_url:   {type: DataTypes.STRING(150)},
    address_field:   {type: DataTypes.STRING(170)},
    address_landmark:{type: DataTypes.STRING(50)},
    location_url:    {type: DataTypes.STRING(255)},
    start_date:      {type: DataTypes.STRING(10)},
    end_date:        {type: DataTypes.STRING(10)},
    phone_primary:   {type: DataTypes.STRING(20)},
    phone_secondary: {type: DataTypes.STRING(20)},
    phone_tertiary:  {type: DataTypes.STRING(20)},
    email:           {type: DataTypes.STRING(50)},
    comments:        {type: DataTypes.STRING(255)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Event.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Events table
      Event.hasMany(models.EventTag, {foreignKeyConstraint: true}); // TODO
      // ^ will add FK to EventTag table
      Event.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
    }
  });
  return Event;
};
