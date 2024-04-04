const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Tickets = db.define("tickets", {

    responsible_id: {
      type: Sequelize.INTEGER,
      allowNull: true
    },

    responsible_name: {
      type: Sequelize.STRING,
      allowNull: true
    },

    content: {
        type: Sequelize.STRING,
        allowNull: false
    },

    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'new'
    },

  });


  module.exports = Tickets