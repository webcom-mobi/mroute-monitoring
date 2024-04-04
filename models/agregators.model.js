const Sequelize = require("sequelize");
const db = require('../utils/db.utils')

const Agregators = db.define("agregators", {
    provider: {
      type: Sequelize.STRING,
      allowNull: false
    },

    platform: {
        type: Sequelize.STRING,
        allowNull: false
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false
    },

    systemId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    
    description: {
        type: Sequelize.STRING,
        allowNull: true
    },

    type: {
        type: Sequelize.STRING,
        allowNull: false
    },

    
    tags: {
        type: Sequelize.STRING,
        allowNull: true
    },

    etalon: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    
    min_persent: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
      
    max_persent: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
      
    min_volume: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    daily_limit: {
        type: Sequelize.INTEGER,
        allowNull: true
    },

    email: {
        type: Sequelize.STRING,
        allowNull: true
    },

    telegram: {
        type: Sequelize.STRING,
        allowNull: true
    },

    priority: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },

    hasError: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },

    works: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },

    showInMonitoring: {
        type: Sequelize.INTEGER,
        defaultValue: 1
    },

    is_daily_limit_exceeded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    }
  });


  module.exports = Agregators