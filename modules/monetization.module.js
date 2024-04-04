const axios = require('axios')
const { API_BASE, SMSKA_URL } = require('../config/app.config')
const cron = require('node-cron')


const monetizationModule = async function () {
    console.log('[INFO] Monetization fucnion calling');

    cron.schedule('0 * * * *', async function() {
        const allMonetizationAccounts = await axios.get(`${API_BASE}/monetization/`);




        const smskaRequest = await axios.get(`${SMSKA_URL}`, {
            headers: {
                'auth': process.env.SMSKA_KEY
            }
        });


    });
}

module.exports = monetizationModule;