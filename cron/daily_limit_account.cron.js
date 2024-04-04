const cron = require('node-cron')
const axios = require('axios')
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage } = require('../utils/bot.utils')
const Accounts = require('../models/accounts.model')

module.exports = (cronString) => {

    cron.schedule(cronString, async function () { 
        const accounts = await axios.get(`${API_BASE}/acc/`)
        accounts.data.forEach(async (acc) => {

                let accountStat = await axios.get(`${API_BASE}/smpp/accountsStats?id=${acc.login}`)
                accountStat = accountStat.data
                let reqHours = new Date().getHours() - 1

                reqHours = reqHours < 10 ? reqHours = '0' + reqHours : reqHours;

                let additionalMessageText = '';

                if (acc.MNC) {
                    accountStat = accountStat.filter(item => item._attributes.MNC_title.split('=')[1] == acc.MNC)
                    additionalMessageText += ` |${acc.MNC} ${acc.MNC_text ? '('+acc.MNC_text+')' : ''}| `;
                }

                if (acc.SIDs) {
                    accountStat = accountStat.filter(item => item._attributes.originator == acc.SIDs)
                    additionalMessageText += ` |${acc.SIDs}| `;

                }

                if (acc.MCC) {
                    accountStat = accountStat.filter(item => item._attributes.MCC_title.split('=')[1] == acc.MCC)
                    additionalMessageText += ` |${acc.MCC}  ${acc.MCC_text ? '('+acc.MCC_text+')' : ''}| `;
                }

                const totalDeliver = accountStat.reduce((sum, item) => sum += +item._attributes.deliver, 0)
                const daily_limit = acc.daily_limit;
                const send_stat = totalDeliver;
                const isExceeded = acc.is_daily_limit_exceeded;
                
                // console.log(accountStat);
                console.log(acc.login, send_stat, '--', daily_limit, '--', isExceeded );
                //console.log(acc);



                if(send_stat > daily_limit && daily_limit && !isExceeded) {
                    let message = `<strong>Обнаружено превышение дневного лимита на аккаунте!</strong>`;
                    message+=` \r\n Аккаунт: ${acc.login} ${additionalMessageText}  - ${send_stat} / ${daily_limit};`
                    sendMessage(message, bot)
                    await Accounts.update({ is_daily_limit_exceeded: 1 }, { where: { id: acc.id } })
                } 
        });
    });

}