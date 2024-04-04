const cron = require('node-cron')
const axios = require('axios')
const _ = require('lodash');
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage } = require('../utils/bot.utils')
const { isNight } = require('../helpers/index')

module.exports = (cronString) => {
  let lastStateOfModerate = []
  cron.schedule(cronString, async function () {
    if (!isNight()) {
      console.log('[CRON] Moderate cron start');
      const currentState = await axios.get(API_BASE + '/smpp/moderate')

      let filteredState = []
      let message = '';

      const currentDate = new Date().toLocaleString()
      const blackList = ['transit_rek', 'smsclub_dir', 'inkor_gembl']
      if (currentState.data.user) {
        if (!Array.isArray(currentState.data.user)) {
          currentState.data.user = Object.values(currentState.data)
        }
        let requestData = currentState.data.user

        // Получение массива с отфильтрованными агрегаторами
        requestData.forEach(item => {
          if (blackList.includes(item._attributes.login)) {
            if (item._attributes.num_sms > 300) {
              filteredState.push(item._attributes)
            }
          } else {
            filteredState.push(item._attributes)
          }
        })

        //Сделать сраванение прошлого и текущего состояния массивов и если не равны , то только тогда ошибку генерировать.
        //Если не равно прошлое и текущее
        if (!_.isEqual(lastStateOfModerate, filteredState)) {
          console.log('[INFO]: Изменение состояния модерации');
          //Если до этого модерация была пустая скидываем сообщение о сообщениях
          if (lastStateOfModerate.length == 0) {
            // console.log('[INFO]: New message on moderate');
            message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Новые сообщения на модерации!`;
            filteredState.forEach(item => {
              message += `
Клиент: ${item.login} - ${item.num_sms}`
            })
          } else {
            //Если произошло изменения состояния, но не полный сброс
            if (filteredState.length != 0) {
              message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Изменение состояния модерации!`;
              filteredState.forEach(item => {
                message += `
Клиент: ${item.login} - ${item.num_sms}`
              })
            } else {
              message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Изменение состояния модерации! Остались только сообещния из ЧС!`;
            }
            
          }
        }

        // console.log(message)
        sendMessage(message, bot)
        lastStateOfModerate = filteredState

      } else {
        //Если модерации нет - скидываем объект прошлого состония
        console.log('[INFO] Has not moderate message!');
        if (lastStateOfModerate.length != 0) {
          message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Все сообщения сняты с модерации.`
          // console.log(message)
          sendMessage(message, bot)
        }
        lastStateOfModerate = []
      }
    }


  }) //cron
}