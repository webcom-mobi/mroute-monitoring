const cron = require('node-cron')
const axios = require('axios')
const { API_BASE } = require('../config/app.config')
const fs = require('fs')
const path = require('path')

const { promisify } = require('util');
const sleep = promisify(setTimeout);
const { bot, sendMessage } = require('../utils/bot.utils')
const {generateTicket} = require('../utils/ticket.utils')



module.exports = (cronString) => {
    let moduleInError = false; //Состояние модуля  - В ошибке  / Не в ошибке
    let plugErrorCount = 0; // Кол-во уведомлений о заглушке

    cron.schedule(cronString, async function () {


        const queue = await axios.get(API_BASE + '/smpp/queue')
        const currentQueueCount = queue.data.count || 0 // Сохраним текущее число очереди

        const queueParams = await axios.get(API_BASE + "/smpp/params")
        const plugQueue = await axios.get(API_BASE + '/smpp/plugqueuecount') //Объект с сообщениями на заглушке
        const currentDate = new Date().toLocaleString()


       const {speed_in, speed_out} = queueParams.data.speed_sms._attributes
        /*
        Проверим, есть ли сообщения с ID = 4 (ЗАГЛУШКА)
        */
        
        if(plugQueue.data.length > 30) {
            if(!moduleInError) {
                if(plugErrorCount < 3) {
                    sendMessage(`<strong style='font-weight: bold;'>[${currentDate}]</strong> В очереди есть сообщения на ЗАГЛУШКЕ (${plugQueue.data.length})`, bot)
                    plugErrorCount++
                }
                moduleInError = true
            }
        } else {
            plugErrorCount = 0;
        }

        /*
        *Если очередь > 10 И последние 3 запроса находятся 
        *в интервале от 10 до 20:  делаем информирование

        если скорость отправки < currentQueueCount / 3  - информируем
        старый метод комментриуем
        "нехватает скорости на агрегаторе"  -текст ошибки
        */




        if(speed_out !=0 && speed_in != 0 && speed_out < (speed_in / 3) && currentQueueCount > 50 ) {
            
            //INFO

            if(!moduleInError) {
                //ИНФОРМИРУЕМ
                moduleInError = true
                const message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> ВНИМАНИЕ! Нехватает скорости на агрегаторе! IN: ${speed_in}. OUT: ${speed_out}. COUNT: ${currentQueueCount}`
                sendMessage(message, bot)
                console.log(message)
                generateTicket({content: message})
                return
            } 

        }


        /*
        *1. Если очередь > 100, то делаем 5 запросов каждые 10 сек.
        а) Если по последним 3 запросам есть динамика на снижение (только желательно еще % снижения задать), то ОК
        б) Если очередь остается на этом же уровне или растет, то информируем.

        Текст ошибки - большое кол-во сообщений в очереди.
        */

        if (currentQueueCount >= 100) {
               await sleep(60 * 1000);
               try{
                    const tempReq = await axios.get(API_BASE + '/smpp/queue')
                    const secondQuery = tempReq.data.count || 0
                    if(secondQuery >= currentQueueCount) {
                        if(!moduleInError) {
                            //ИНФОРМИРУЕМ
                            moduleInError = true
                            const message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> ВНИМАНИЕ! Большое кол-во сообщений в очереди! Динамика: ${currentQueueCount} -- ${secondQuery}. 
Аккаунты: ${tempReq.data.accounts} `
                            sendMessage(message, bot)
                            console.log(message)
                            return
                        } 
                    }
               } catch(e) {
                   console.log('Error from queue cron', e);
               }
            
        }

        /*3 кейс 
        x - скорость отправки
        y - скорость приема

        if x  < y/3  && queue > 500 - error 

        */

        if(speed_out !=0 && speed_in != 0 && (speed_out < (speed_in / 3)) && currentQueueCount > 500) {
            if(!moduleInError) {
                //ИНФОРМИРУЕМ
                moduleInError = true
                const message = `<strong style='font-weight: bold;'>[${currentDate}]</strong> ВНИМАНИЕ! Большое кол-во сообщений в очереди и низкая скорость на агрегаторе!  IN: ${speed_in}. OUT: ${speed_out}. COUNT: ${currentQueueCount}`
                sendMessage(message, bot)
                console.log(message)
                return
            } 
        }

        //Если прошли без ошибок - снимаем общий флаг модуля
        moduleInError = false

    });
}

