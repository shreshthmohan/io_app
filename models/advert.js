module.exports = function(sequelize, DataTypes) {
  var Advert = sequelize.define('Advert', {
    title:                {type: DataTypes.STRING(30), allowNull: false},
    description:          {type: DataTypes.STRING(60), allowNull: false},
    image_url:            {type: DataTypes.STRING(1000), allowNull: false},
    web_url:              {type: DataTypes.STRING(555), allowNull: false},
    campaign_start_date:  {type: DataTypes.DATEONLY, allowNull: false}, // This is MySQL DATETIME 
    campaign_end_date:    {type: DataTypes.DATEONLY, allowNull: false},
    active:               {type: DataTypes.BOOLEAN, allowNull: false},
    all:                  {type: DataTypes.BOOLEAN, allowNull: false}
    // ^ http://dev.mysql.com/doc/refman/5.5/en/datetime.html
    // Since sequelize not support the creation of column with MySQL DATE
    // we manually have to alter table after creation of database like so,
    // "alter table Events modify column start_date date;"
    // "alter table Events modify column end_date date;"
    // http://dev.mysql.com/doc/refman/5.5/en/date-and-time-functions.html
    // ^ to properly display dates
  },
  {
    associate: function(models) {
      Advert.hasMany(models.AdvertTag, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to AdvertTag table
      Advert.hasMany(models.AdvertCity, {foreignKeyConstraint: true, onDelete: 'CASCADE'});
      // ^ will add FK to AdvertCity table
    }
  });
  return Advert;
}
