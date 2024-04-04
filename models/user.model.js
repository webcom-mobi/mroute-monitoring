const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Users = db.define("users", {
    login: {
      type: Sequelize.STRING,
      allowNull: false
    },

    email: {
        type: Sequelize.STRING,
        allowNull: false
    },

    password: {
        type: Sequelize.STRING,
        allowNull: false
    },

    role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'user'
    },
  });


  module.exports = Users