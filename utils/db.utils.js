// const mysql = require('mysql2')
const DB_config = require('../config/db.config')
// const db = mysql.createPool(DB_config);

const Sequelize = require("sequelize");
const db = new Sequelize(DB_config.database, DB_config.user, DB_config.password, {
  dialect: "mysql",
  host: DB_config.host,
  logging: false
});

db.sync().then(result=>{
    // console.log(result);
})
.catch(err=> console.log(err));

module.exports =  db