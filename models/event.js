module.exports = function(sequelize, DataTypes) {
  var Event = sequelize.define('Event',
  {
    event_name:      {type: DataTypes.STRING(60), allowNull: false}, 
    event_url:       {type: DataTypes.STRING(255)},
    organiser_name:  {type: DataTypes.STRING(80)},
    organiser_url:   {type: DataTypes.STRING(255)},
    address_field:   {type: DataTypes.STRING(255)},
    location_url:    {type: DataTypes.STRING(255)},
    start_date:      {type: DataTypes.DATE},
    end_date:        {type: DataTypes.DATE},
    // ^ http://dev.mysql.com/doc/refman/5.5/en/datetime.html
    comments:        {type: DataTypes.STRING(255)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Event.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Events table
      Event.hasMany(models.EventTag, {foreignKeyConstraint: true});
      // ^ will add FK to EventTag table
      Event.hasMany(models.SocialLink, {foreignKeyConstraint: true});
      // ^ will add FK to SocialLinks table
      Event.hasMany(models.Email, {foreignKeyConstraint: true});
      // ^ will add FK to Emails  table
      Event.hasMany(models.PhoneNumber, {foreignKeyConstraint: true});
      // ^ will add FK to PhoneNumbers table
    }
  });
  return Event;
};
