const cron = require('node-cron')
const axios = require('axios')
const _ = require('lodash');

const { API_BASE } = require('../config/app.config')

const { bot, sendMessage } = require('../utils/bot.utils')
const { generateTicket } = require('../utils/ticket.utils')



module.exports = (cronString) => {
    let lastStateOfModerate = {}
    cron.schedule(cronString, async function () {
        const currentMessageOnModerate = await axios.get(API_BASE + '/smpp/moderate')
        let usersSet = []    
        let message = '';
        const currentDate = new Date().toLocaleString()
        if(currentMessageOnModerate.data.message) {
          try{
            if(Array.isArray(currentMessageOnModerate.data.message)) {
                currentMessageOnModerate.data.message.forEach(item => {
                    usersSet.push(item._attributes.login)
                })
            } else {
                usersSet.push(currentMessageOnModerate.data.message._attributes.login)
            }
            let usersSetUniq = new Set(usersSet)
            //Костыль для transit_rek
            let transit_count = Array.isArray(currentMessageOnModerate.data.message) ? currentMessageOnModerate.data.message.filter(item=> item._attributes.login == 'transit_rek').length : 1;
            if(Array.from(usersSetUniq)[0] == 'transit_rek' && usersSetUniq.size == 1 && transit_count < 4) {
                    console.log('Set moderate hack message');
                    return
            }
            //Сделать сраванение прошлого и текущего состояния массивов и если не равны , то только тогда ошибку генерировать.
            //Если не равно прошлое и текущее
            if(!_.isEqual(lastStateOfModerate, currentMessageOnModerate.data)) {
                //Если до этого модерация была пустая скидываем сообщение о сообщениях
                if(_.isEqual(lastStateOfModerate, {})){
                     message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Новые сообщения на модерации! `;
                    Array.from(usersSetUniq).forEach(user => {
                        message += `
Логин клиента :${user}
Количество SMS на модерации: (${currentMessageOnModerate.data.message.filter(item=> item._attributes.login == user).length || 0})
`
                    })
                 
                } else {
                   //Если произошло изменения состояния, но не полный сброс
                   //Если сообщения снялись с модерации полностью
                   if(!currentMessageOnModerate.data.message.length) {
                        message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Сообщения сняты с модерации. Кол-во SMS на модерации - 0`
                   } else if( currentMessageOnModerate.data.message.length < lastStateOfModerate.message.length) {
                       //если снялись частично
                       message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Сообщения сняты с модерации. Кол-во SMS на модерации - ${currentMessageOnModerate.data.message.length} (${Array.from(usersSetUniq).join(', ')}) `
                   } else if(currentMessageOnModerate.data.message.length > lastStateOfModerate.message.length) {
                       //Если сообщения добавились
                       message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> Новые сообщения на модерации!
  `;

                    Array.from(usersSetUniq).forEach(user => {
                        message += `
Логин клиента :${user}
Количество SMS на модерации: (${currentMessageOnModerate.data.message.filter(item=> item._attributes.login == user).length || 0})
`
                        })
                   }
                }
               
            } else {
//                 var message = `Необходимо просмотреть модерацию, прошло более 10 мин!
// Логины: `;
//                 Array.from(usersSet).forEach(user => {
//                     message += `${user} (${currentMessageOnModerate.data.message.filter(item=> item._attributes.login == user).length || 0}) `
//                 })

            }

       
            console.log(message)

            sendMessage(message, bot)
            //Изменяем прошлое состояние полной копией объекта
            Object.assign(lastStateOfModerate, currentMessageOnModerate.data) 
        } catch(e) {
            // console.log(e);
        }

        }  else {
            //Если модерации нет - скидываем объект прошлого состония
            Object.assign(lastStateOfModerate, {}) 
        }

        
    })
}

