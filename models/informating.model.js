const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Informating = db.define("Informatings", {
 
    action: {
        type: Sequelize.STRING,
        allowNull: false
    },

    contact: {
        type: Sequelize.STRING,
        allowNull: false
    },

    template_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    user_id: {
    type: Sequelize.INTEGER,
    allowNull: false
    },
  
  });
  


  module.exports = Informating