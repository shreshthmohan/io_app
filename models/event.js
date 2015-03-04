module.exports = function(sequelize, DataTypes) {
  var Event = sequelize.define('Event',
  {
    event_name:      {type: DataTypes.STRING(60), allowNull: false}, 
    event_name_slug: {type: DataTypes.STRING(60), allowNull: false}, 
    event_url:       {type: DataTypes.STRING(555)},
    organiser_name:  {type: DataTypes.STRING(80)},
    organiser_url:   {type: DataTypes.STRING(555)},
    address_field:   {type: DataTypes.STRING(255)},
    location_url:    {type: DataTypes.STRING(555)},
    img_url_square:  {type: DataTypes.STRING(555)},
    start_date:      {type: DataTypes.DATE}, // This is MySQL DATETIME 
    end_date:        {type: DataTypes.DATE},
    // ^ http://dev.mysql.com/doc/refman/5.5/en/datetime.html
    // Since sequelize not support the creation of column with MySQL DATE
    // we manually have to alter table after creation of database like so,
    // "alter table Events modify column start_date date;"
    // "alter table Events modify column end_date date;"
    // http://dev.mysql.com/doc/refman/5.5/en/date-and-time-functions.html
    // ^ to properly display dates
    comments:        {type: DataTypes.STRING(255)}
  },
  {
    associate: function(models) { //create associations/foreign key constraint
      Event.belongsTo(models.City, {foreignKeyConstraint: true});
      // ^ will add FK to Events table
      Event.hasMany(models.EventTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to EventTag table
      Event.hasMany(models.EventSubtag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to EventSubtag table
      Event.hasMany(models.SocialLink, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to SocialLinks table
      Event.hasMany(models.Email, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to Emails  table
      Event.hasMany(models.PhoneNumber, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to PhoneNumbers table
    }
  });
  return Event;
};
