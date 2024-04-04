const cron = require('node-cron')
const axios = require('axios')
const moment = require('moment')
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage } = require('../utils/bot.utils')


module.exports = (cronString) => {

    cron.schedule(cronString, async function () {
        console.log('[INFO]: CRON BALANCE START');

        const currentResponse = await axios.get(API_BASE + '/smpp/balance');

        if (currentResponse.error) {
            console.log('[INFO]: Нет данных о балансе');
            return false;
        }



        //Вычисляем текущий час
        //"0000-00-00 00:00:00"
        const currentDataString = moment().subtract(3,'h').format('YYYY-MM-DD HH');
        const currentBalanceState = currentResponse.data.balance;
        console.log(currentBalanceState);
        const resultBalanceArray = currentBalanceState.filter(item =>  item._attributes.time_send_small_balance.includes(currentDataString));
        // const resultBalanceArray = currentBalanceState.filter(item =>  item._attributes.time_send_small_balance.includes('2022-10-13 10'));


        // console.log('[RESPONCE]:', currentDataString,  resultBalanceArray, currentBalanceState);
        console.log(currentBalanceState.find(i=>i._attributes.login === 'smsclub_otp'),currentDataString );
        //smsclub_otp


        if(resultBalanceArray.length !== 0) {
            let message = `<strong>Отправлены новые сообщения о критическом балансе!</strong>
 `
            resultBalanceArray.forEach(item => {
                message+=`
Аккаунт: ${item._attributes.login}; 
Время: ${item._attributes.time_send_small_balance.split(' ')[1]}
Баланс: ${item._attributes.balance}
Критический баланс: ${item._attributes.small_balance}
Менеджер: ${item._attributes.manager}
=====================` 
            })
            sendMessage(message, bot)
        }
    })
}

