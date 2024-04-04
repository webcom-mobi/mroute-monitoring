//Модерация состояния агрегатора
const cron = require('node-cron')
const axios = require('axios')
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage } = require('../utils/bot.utils')
const Agregators = require('../models/agregators.model')

module.exports = (cronString) => {

    cron.schedule(cronString, async function () { 
        const state = await axios.get(API_BASE + '/smpp/stats')
        const agregators = await axios.get(API_BASE + '/agregators/')
        let message = `<strong>Обнаружено превышение дневного лимита!</strong>`;
        let exceeded_agr = 0;
        state.data.stat.forEach(async (agr) => {

            const current_agregator = agregators.data.find(item => item.name === agr._attributes.id_aggregating)
            if(!current_agregator?.showInMonitoring)  {
                return false;
            }

            if (current_agregator != undefined && current_agregator.platform == 'my3') {
                    const daily_limit = current_agregator.daily_limit;
                    const send_stat = agr._attributes.deliver;
                    const isExceeded = current_agregator.is_daily_limit_exceeded;

                    console.log(agr._attributes.id_aggregating, send_stat, '--', daily_limit, '--', isExceeded );


                    if(send_stat > daily_limit && daily_limit !== 0 && !isExceeded) {
                            exceeded_agr++;
                            message+=` \r\n Агрегатор: ${agr._attributes.id_aggregating} - ${send_stat} / ${daily_limit};`
                            await Agregators.update({ is_daily_limit_exceeded: 1 }, { where: { id: current_agregator.id } })
                    } else if(isExceeded) {
                        await Agregators.update({ is_daily_limit_exceeded: 0 }, { where: { id: current_agregator.id } })
                    }

                    //Если все превысело, но флага нет - ставим флаг + сообщение
                    // если не превысило, но есть флаг - скинуть флаг в 0
            }
        });
        if(exceeded_agr > 0) {
            console.log(message);
            sendMessage(message, bot)
        }
    });
}

