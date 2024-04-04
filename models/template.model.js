const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Template = db.define("templates", {
    content: {
      type: Sequelize.TEXT,
      allowNull: false
    },

    title: {
        type: Sequelize.STRING,
        allowNull: false
    }
  });


  module.exports = Template