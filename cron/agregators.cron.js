//Модерация состояния агрегатора
const cron = require('node-cron')
const axios = require('axios')

const { API_BASE } = require('../config/app.config')
const Agregators = require('../models/agregators.model')

const { bot, sendMessage } = require('../utils/bot.utils')
const { generateTicket } = require('../utils/ticket.utils')

module.exports = (cronString) => {

    cron.schedule(cronString, async function () { 
        /*
           * 1) получаем агрегаторов
           * 2) Проверяем из last-state поле
           * 3) Если оно изменилось  - уведомление и изменение last-state
           */
        const agregatorsFromAPI = await axios.get(API_BASE + '/smpp/agregators/')
        const agregatorsFromPanel = await axios.get(API_BASE + '/agregators/')

        agregatorsFromPanel.data.forEach(async agr => {
            if (agr.platform == 'my3') {
                const currentAgregator = agregatorsFromAPI.data.aggregating.find(item => item._attributes.name == agr.name)
                if (currentAgregator) {
                    if (agr.works != currentAgregator._attributes.works) {  //Агрегаор изменил свое состояние с последнего вызова
                        //Обновим состояние агрератора
                        await Agregators.update({ works: currentAgregator._attributes.works }, {
                            where: {
                                id: agr.id
                            }
                        })
                        //Составим ошибку
                        const currentDate = new Date().toLocaleString() 
                        const newStateString = currentAgregator._attributes.works == 1 ? 'ON!' : 'OFF!'
                        const message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> ‼ Соединение ${currentAgregator._attributes.type}  ${currentAgregator._attributes.name}[${currentAgregator._attributes.id_aggregating} - ${currentAgregator._attributes.login}]  изменил состояние на <strong style='color: red; font-weight: bold;'> [${newStateString}] </strong>!`
                        console.log(message);
                        sendMessage(message, bot)
                        // generateTicket({ content: message })
                    }
                }
            }
        })
    })
}

