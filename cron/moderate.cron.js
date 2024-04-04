const cron = require('node-cron')
const axios = require('axios')
const _ = require('lodash');
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage } = require('../utils/bot.utils')



module.exports = (cronString) => {
    let lastStateOfModerate = []
    cron.schedule(cronString, async function () {
        const currentMessageOnModerate = await axios.get(API_BASE + '/smpp/moderate')
        let message = '';
        const currentDate = new Date().toLocaleString()

        if(currentMessageOnModerate.data.user) {
          try{

            if (!Array.isArray(currentMessageOnModerate.data.user)) {
                currentMessageOnModerate.data.user = Object.values(currentMessageOnModerate.data)
            }
            let requestData = currentMessageOnModerate.data.user

            
            //Сделать сраванение прошлого и текущего состояния массивов и если не равны , то только тогда ошибку генерировать.
            //Если не равно прошлое и текущее
            if(lastStateOfModerate.length != currentMessageOnModerate.data.user.length) {

                //Если до этого модерация была пустая скидываем сообщение о сообщениях
                if(lastStateOfModerate.length == 0 ){
                     message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Новые сообщения на модерации!`;
                     requestData.forEach(item => {
                        message += `
Клиент: ${item._attributes.login} - ${item._attributes.num_sms}`
                    })
                } else {
                   //Если произошло изменения состояния, но не полный сброс
                   //Если сообщения снялись с модерации полностью
                   if(!requestData) {
                        message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Все сообщения сняты с модерации.`
                   } else if( requestData.length < lastStateOfModerate.length) {
                       //если снялись частично
                       message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Сообщения сняты с модерации частично.
Текущее состояние: `
                       requestData.forEach(user => {
                        message += `
Клиент: ${user._attributes.login} - ${user._attributes.num_sms}`
                    })
                   } else if(requestData.length > lastStateOfModerate.length) {
                       //Если сообщения добавились
                       message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Новые сообщения на модерации!`;

                        requestData.forEach(user => {
                            message += `
Клиент: ${user._attributes.login} - ${user._attributes.num_sms}`
                        })
                   } else {
                        console.log('[INFO]: DEFAULT BEHAVIOUR!');
                   }
                }
            } 

            let transit_stat = currentMessageOnModerate.data.user.find(item=> item._attributes.login == 'transit_rek')
            let transit_count = transit_stat ? transit_stat._attributes.num_sms : null;

            if( transit_count < 500 && transit_count && requestData.length == 1 ) {
            // if( transit_count < 500 && transit_count && requestData.length == 1 && lastStateOfModerate.length == 1) {
                    console.log('[INFO]: transit_count hack');
                    return
            }


            // console.log(message)
            // sendMessage(message, bot)
            //Изменяем прошлое состояние полной копией объекта
            lastStateOfModerate = currentMessageOnModerate.data.user
        } catch(e) {
            console.log('[ERROR]',e);
        }

        }  else {
            //Если модерации нет - скидываем объект прошлого состония
            console.log('[INFO] Has not moderate message!');
            lastStateOfModerate = []
        }

        
    })
}

