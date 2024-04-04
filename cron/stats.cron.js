const cron = require('node-cron')
const axios = require('axios')
const { promisify } = require('util');
const sleep = promisify(setTimeout);

const { API_BASE } = require('../config/app.config')
const Agregators = require('../models/agregators.model')

const { bot, sendMessage, sendStateMessageWithButton } = require('../utils/bot.utils')
const { generateTicket } = require('../utils/ticket.utils')



module.exports = (cronString) => {

    cron.schedule(cronString, async function () {
        const state = await axios.get(API_BASE + '/smpp/stats')
        const agregators = await axios.get(API_BASE + '/agregators/')
        const currentDate = new Date().toLocaleString()
        state.data.stat.forEach(async (agr) => {

            const current_agregator = agregators.data.find(item => item.name === agr._attributes.id_aggregating)
            // console.log(current_agregator);
            //Если в параметрах агрегатора стоит "не показывать" - выходим из функции
            if(!current_agregator?.showInMonitoring)  {
                return false;
            }

            if (current_agregator != undefined && current_agregator.platform == 'my3') {

                if (current_agregator.type == 'HLR') {
                    if (agr._attributes.deliver_p < current_agregator.min_persent && agr._attributes.send > current_agregator.min_volume) {

                        //Если агрегатор уже в ошибке уведомлять заного не надо
                        if (current_agregator.hasError == 0) { 
                            const message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> ВНИМАНИЕ HLR: агрегатор ${agr._attributes.id_aggregating} - низкая доставка!`
                            console.log(message);
                            // sendMessage(message, bot)
                            sendStateMessageWithButton(message, bot, agr._attributes.id_aggregating)
                            //Ставим в ошибку
                            await Agregators.update({ hasError: 1 }, { where: { id: current_agregator.id } })

                        }
                    } else if (agr._attributes.deliver_p > current_agregator.max_persent && agr._attributes.send > current_agregator.min_volume) {

                        if (current_agregator.hasError == 0) {
                            const message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> ВНИМАНИЕ HLR: агрегатор ${agr._attributes.id_aggregating} - подозрение на фейки!`
                            console.log(message);
                            // sendMessage(message, bot)
                            sendStateMessageWithButton(message, bot, agr._attributes.id_aggregating)
                            await Agregators.update({ hasError: 1 }, { where: { id: current_agregator.id } })
                        }
                    } else {
                        await Agregators.update({ hasError: 0 }, { where: { id: current_agregator.id } })
                    }
                } else {

                    // console.log(agr._attributes.deliver_p, current_agregator.etalon );
                    if (agr._attributes.deliver_p < current_agregator.etalon && agr._attributes.send > current_agregator.min_volume) {

                        /*
                            1.Получить список агрегаторов еще 3 раза
                            2. На основе данных сформировать массив из кол-ва сообщений
                            3. Если все 3 запроса кол-во растет больше чем на 100 в запрос - идет рассылка.
                            4. Иначе ошибка 
                        */

                        await sleep(240 * 1000); //Ждем 4 минуты и делаем повторный запрос
                        try{
                            const secondRequest = await axios.get(API_BASE + '/smpp/stats')
                            const secondAgrStat = secondRequest.data.stat.find(item => item._attributes.id_aggregating === agr._attributes.id_aggregating)
                            //Если процент стал еще меньше, генерируем ошибку
                            if(secondAgrStat._attributes.deliver_p <= agr._attributes.deliver_p ) {
const message = `
<strong style='font-weight: bold;'>[${currentDate}]</strong> Внимание: низкий % доставки!
Агрегатор: <strong>${current_agregator.name}</strong>
SYSTEM_ID: <strong>${current_agregator.systemId}</strong>
------------------
ВСЕГО СМС:  <b>${secondAgrStat._attributes.send}</b>
------------------
Доставлено: <b>${secondAgrStat._attributes.deliver} (${secondAgrStat._attributes.deliver_p}%)</b> 
Не доставлено: <b>${secondAgrStat._attributes.not_deliver}</b>
Прочитано: <b>${secondAgrStat._attributes.read} (${secondAgrStat._attributes.read_p}%)</b> 
В процессе: <b>${secondAgrStat._attributes.partly_deliver}</b> 
Просрочено: <b>${secondAgrStat._attributes.expired}</b>
Для получения информации о канале, пропишите:  /get_stat ${current_agregator.name}
`


                                if (current_agregator.hasError == 0) {
                                    // const message = `ВНИМАНИЕ: агрегатор ${agr._attributes.id_aggregating} - низкий процент доставки (${agr._attributes.deliver_p})!`
                                    console.log(message);
                                    sendStateMessageWithButton(message, bot, agr._attributes.id_aggregating)
                                    await Agregators.update({ hasError: 1 }, { where: { id: current_agregator.id } })
                                }

                            }
                        } catch(e) {
                            console.log(e);
                        }
 
                    } else {
                        await Agregators.update({ hasError: 0 }, { where: { id: current_agregator.id } })
                    }
                }
            }
        });
    })
}

