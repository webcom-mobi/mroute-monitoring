const cron = require('node-cron')
const axios = require('axios')
const _ = require('lodash')
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage } = require('../utils/bot.utils')
const moment  = require('moment')


module.exports = (cronString) => {

    // let tempState = []

    cron.schedule(cronString, async function () {
         const currentResponse =  await axios.get(API_BASE + '/smpp/distribution_archive')

         if (currentResponse.error) {
            console.log('[INFO]: Нет данных о логах')
            return
         }

         console.log('CRON PULL START');
         const currentResponceData = currentResponse.data.distribution_archive

        //  console.log(currentResponceData);

        //  console.log(moment.duration(moment('2021-11-04 13:10:08').diff(moment('2021-11-04 13:00:08'))).asMinutes());

         currentResponceData.forEach(item =>  {
            const now = moment(new Date()).subtract(3,'h') 
            const end = moment(item._attributes.date_insert) 
            const duration = moment.duration(now.diff(end))
            const minutes = duration.asMinutes()


            //Если произошло изменение в течении 10 минут
            if (Math.floor(minutes) < 10) {
                console.log(Math.floor(minutes))

                let message = `
<b>Новое сообщение в логах блокировки!</b>
${item._attributes.date_insert } Блокировка агрегатора  ${item._attributes.name_aggregating } в пуле ${item._attributes.name_group_aggregating}!
Эталонное значение - ${item._attributes.deliver_percent }
Фактическое значение - ${item._attributes.new_deliver_percent }
Текущий статус агрегатора - ${item._attributes.cope == 1 ? 'Заблокирован' : 'Разблокирован' }
                `;


//                 // Проверяем что произошло снятие или открытие пула
//                 const lastTempState = tempState.find(tempitem => tempitem._attributes.name_aggregating == item._attributes.name_aggregating)

//                 //Если данные есть - проверяем что было раньше и делаем уведку исходя из этого
//                 if (lastTempState) {

//                     if (lastTempState._attributes.cope == 1) {
//                         message = `
// ${item._attributes.date_insert } Разблокировка агрегатора  ${item._attributes.name_aggregating } в пуле ${item._attributes.name_group_aggregating}.
// Текущий статус агрегатора - Разблокирован
//                         `
//                     } else {
//                         message = `

//                         `
//                     }

//                 } else {//Если данных нет - ыводим уведку о блоке

//                 }
                sendMessage(message, bot)
            }
         })

        
        // Перезапишем хранилеще
        // tempState = currentResponceData
    })
}

