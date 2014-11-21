var fs        = require('fs');
var path      = require('path');
var Sequelize = require('sequelize');
var lodash    = require('lodash');
var sequelize = new Sequelize('io_app', 'root', 'clock');
// ^ TODO: fix collation, charset (UTF-8)
var db        = {}; // array object that is key-value type

// Importing models from each file in the models directory except index.js
fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return ((file.indexOf('.') !== 0) && (file !== 'index.js') &&
            (file.slice(-3) == '.js'))
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file))
    db[model.name] = model
    // ^ name here is that given during sequelize.define
  });

// Calling associate function to make associations or create foreign keys
Object.keys(db).forEach(function(modelName) {
  if (db[modelName].options.hasOwnProperty('associate')) {
    db[modelName].options.associate(db)
  }
});

// exporting db by adding sequelize instance and Sequelize itself
// db already has model objects corresponding to each table in the database
module.exports = lodash.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);
