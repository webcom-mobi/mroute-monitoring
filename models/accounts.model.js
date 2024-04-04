const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Accounts = db.define("accounts", {
    login: {
      type: Sequelize.STRING,
      allowNull: false
    },

    isModerate: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'new'
    },

    CodeName: {
      type: Sequelize.STRING,
      allowNull: true
    },

    ParametrString: {
      type: Sequelize.STRING,
      allowNull: true
    },

    CronString: {
      type: Sequelize.STRING,
      allowNull: true
    },

    MCC: {
      type: Sequelize.STRING,
      allowNull: true
    },


    MCC_text: {
      type: Sequelize.STRING,
      allowNull: true
    },

    MNC: {
      type: Sequelize.STRING,
      allowNull: true
    },

    MNC_text: {
      type: Sequelize.STRING,
      allowNull: true
    },

    SIDs: {
      type: Sequelize.STRING,
      allowNull: true
    },

    comment: {
        type: Sequelize.STRING,
        allowNull: true
    },

    lastTraficState: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    },

    noTraficMsg: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },

    daily_limit: {
      type: Sequelize.INTEGER,
      allowNull: true
    },

    is_daily_limit_exceeded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }

  });


  module.exports = Accounts