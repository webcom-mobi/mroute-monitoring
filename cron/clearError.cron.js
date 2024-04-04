const cron = require("node-cron");
const Agregators = require("../models/agregators.model");
const Accounts = require('../models/accounts.model')
const axios = require('axios')
const { API_BASE } = require('../config/app.config')

module.exports = (cronString) => {
  cron.schedule(cronString, async function () {
    await Agregators.update({ hasError: 0 }, { where: { hasError: 1 } });


    //Clear Account Error
    const accounts = await axios.get(`${API_BASE}/acc/`)
    accounts.data.forEach(async (acc) => {
      await Accounts.update({ is_daily_limit_exceeded: 0 }, { where: { id: acc.id } })
    });


  });
};
