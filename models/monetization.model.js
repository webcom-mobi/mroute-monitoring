const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Monetization = db.define("monetization", {
    login: {
      type: Sequelize.STRING,
      allowNull: false
    },

    isActive: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'true'
    },
    password: {
        type: Sequelize.STRING,
        allowNull: true
    },
    api_key: {
        type: Sequelize.STRING,
        allowNull: true
    },
    stream_id: {
        type: Sequelize.STRING,
        allowNull: true
    },
    keywords: {
        type: Sequelize.STRING,
        allowNull: true
    },

    period: {
        type: Sequelize.STRING,
        allowNull: true
    },

    comment: {
        type: Sequelize.STRING,
        allowNull: true
    },

    log: {
        type: Sequelize.STRING,
        allowNull: true
    }
  });


  module.exports = Monetization