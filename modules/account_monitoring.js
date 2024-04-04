/*
*   Модуль мониторинга аккаунтов
*/
const axios = require('axios')
const { API_BASE } = require('../config/app.config')
const { sendTG, sendSMS, sendEmail } = require('../utils/informating.utils')
const cron = require('node-cron')
const { replacer } = require('../utils/template.utils')

const accountsMonitorig = async function () {
    console.log('[INFO] Monitoring fucnion calling');
    // Включить что бы делать сброс каждый час, чтобы обрабатывались новые заявки
    // cron.schedule('58 * * * *', async function () {
    const allAccount = await axios.get(`${API_BASE}/acc/`)
    allAccount.data.forEach(async acc => {
        const { data: informatings } = await axios.get(`${API_BASE}/informating/${acc.id}`)
        //Trafic control section
        if (acc.ParametrString.includes('traficControl')) {

            cron.schedule('0 * * * *', async function () {
                //Костыль для исключения 0 часа из проверки.
                if(new Date().getHours() == 0) {
                    return;
                }
                //-------
                let accountStat = await axios.get(`${API_BASE}/smpp/hourlyaccountstats?id=${acc.login}`)
                accountStat = accountStat.data
                let reqHours = new Date().getHours() - 1

                reqHours = reqHours < 10 ? reqHours = '0' + reqHours : reqHours;

                let additionalMessageText = '';

                accountStat = accountStat.filter(item => item._attributes.hours.split(' ')[1] == `${reqHours}:00`)

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


                let INFOMESSAGE = '';
                await axios.post(`${API_BASE}/acc/update`, acc);
                if (!accountStat.length && acc.lastTraficState == 1) {
                    INFOMESSAGE = `Изменение состояния аккаунта ${acc.CodeName} (${acc.MCC_text || "-"}) ${additionalMessageText} - нет трафика!`
                    acc.lastTraficState = 0;
                }

                const totalSend = accountStat.reduce((sum, item) => sum += +item._attributes.send, 0)

                if (accountStat.length && acc.lastTraficState == 0 && totalSend > 100) {
                    INFOMESSAGE = `Изменение состояния аккаунта ${acc.CodeName} (${acc.MCC_text || "-"}) ${additionalMessageText} - трафик возвращен!`
                    acc.lastTraficState = 1;
                }

                await axios.post(`${API_BASE}/acc/update`, acc);

                console.log('message', INFOMESSAGE);
                if (INFOMESSAGE) {
                    informatings.forEach(async item => {

              
                        switch (item.action) {
                            case 'group':
                                sendTG(item.contact, INFOMESSAGE)
                                break
                            case 'email':
                                sendEmail(item.contact, INFOMESSAGE, 'Изменение состояния трафика!')
                                break
                            case 'sms':
                                sendSMS(item.contact, INFOMESSAGE)
                                break
                        }
                    })
                }
            });
        }



        if (acc.CronString && acc.isModerate == 'true') {
            let currentInfoMessage = 1;
            let hasntTraficInfoMessage = 1;
            //template for cron 
            cron.schedule(
                acc.CronString
                // "* * * * *"
                , async function () {
                if (acc.isModerate) { //if account moderate mode is ON
                    //parse monitoring string
                    let curDate = new Date();

                    var now_utc = Date.UTC(curDate.getUTCFullYear(), curDate.getUTCMonth(),
                    curDate.getUTCDate(), curDate.getUTCHours(),
                    curDate.getUTCMinutes(), curDate.getUTCSeconds());

                    // curDate = new Date(now_utc);


                    let currentHours = curDate.getUTCHours();
                    //в 0 не делаем проверки , что бы не поломать расчеты
                    if (currentHours == 0) {
                        return
                    }
                    const param = acc.ParametrString.split(' ')[0]
                    const evalParam = acc.ParametrString.split(' ')[1]
                    const value = acc.ParametrString.split(' ')[2]
                    const senderName = acc.SIDs || null
                    //get stat for account 
                    const accountLogin = acc.login
                    
                    let accountStat = null
                    //Получение нужной статистики в зависимости от кронСтроки
                    if ('59 23 * * *' == acc.CronString) {
                        accountStat = await axios.get(`${API_BASE}/smpp/accountsStats?id=${accountLogin}`)
                        accountStat = accountStat.data
                    } else {
                        accountStat = await axios.get(`${API_BASE}/smpp/hourlyaccountstats?id=${accountLogin}`)
                        accountStat = accountStat.data

                        let reqHours = currentHours - 1
                        //Добавляем нолик , что бы не считаь хуйню
                        if (reqHours < 10) {
                            reqHours = '0' + reqHours;
                        }

                        accountStat = accountStat.filter(item => {
                            
                 
                            return item._attributes.hours.split(' ')[1] === `${reqHours}:00`
                        })
                        
                    }

                  
                    

                    // if (acc.MNC) {
                    //     accountStat = accountStat.filter(item => item._attributes.MNC_title.split('=')[1] == acc.MNC)
                    // }

                    // if (acc.MCC) {
                    //     accountStat = accountStat.filter(item => item._attributes.MCC_title.split('=')[1] == acc.MCC)
                    // }

                    // if (senderName) {
                    //     accountStat = accountStat.filter(item => item._attributes.originator == senderName)
                    // }

                   

              

                    // get value of monitoring param
                    let monitoringValue = 0

                    const sendCount = Math.round(accountStat.reduce((sum, item) => sum += +item._attributes.send, 0));
                    const NOTIFICATION_MINIMUM_COUNT = 50;
                   
                    if (accountStat.length != 0) {
                        switch (param) {
                            case 'percent':
                                const v_send = accountStat.reduce((sum, item) => sum += +item._attributes.send, 0)
                                const v_deliver = accountStat.reduce((sum, item) => sum += +item._attributes.deliver, 0)
                                monitoringValue = Math.round((v_deliver / v_send) * 100)
                                break;

                            case 'vSend':
                                monitoringValue = Math.round(accountStat.reduce((sum, item) => sum += +item._attributes.send, 0))

                                break;

                            case 'vDelivery':
                                monitoringValue = Math.round(accountStat.reduce((sum, item) => sum += +item._attributes.deliver, 0))
                                break;

                            case 'without':
                                monitoringValue = null
                                break;
                        }


                        // Собираем все данные в 1 массив



                        // console.log(`${monitoringValue}${evalParam}${value}`);
                        // check monitoringValue mode (has error on not)
                        const confirmEval = eval(`${monitoringValue}${evalParam}${value}`)


                        if (!confirmEval && NOTIFICATION_MINIMUM_COUNT < sendCount) {
                            informatings.forEach(async item => {
                                //get template 
                                const template = await axios.get(`${API_BASE}/template/${item.template_id}`)
                                const replacedTitle = replacer(template.data.title, accountStat, acc, monitoringValue)
                                const replacedContent = replacer(template.data.content, accountStat, acc, monitoringValue)

                           
                                if (currentInfoMessage == 1) { //Нужно уведомлять если = 1
                                    switch (item.action) {
                                        case 'group':
                                            sendTG(item.contact, replacedContent)
                                            break
                                        case 'email':
                                            sendEmail(item.contact, replacedContent, replacedTitle)
                                            break
                                        case 'sms':
                                            sendSMS(item.contact, replacedContent)
                                            break
                                    }
                                }
                                currentInfoMessage == 3 ? currentInfoMessage = 1 : currentInfoMessage++;
                            })
                        } else {
                            currentInfoMessage = 1
                        }
                    } else { //Если трафик снят
                        console.log(`Account: ${accountLogin} - hasnt traffic`)
                        console.log('acc.noTraficMsg status', acc.noTraficMsg);
                        //Уведомлять только если стоит галочка
                        if(acc.noTraficMsg) {
                            const INFOMESSAGE = `Аккаунт: ${accountLogin} (${acc.MCC_text || "-"}) - нет трафика!`
                            informatings.forEach(async item => {
                                if (hasntTraficInfoMessage == 1) { //Нужно уведомлять если = 1
                                    switch (item.action) {
                                        case 'group':
                                            sendTG(item.contact, INFOMESSAGE)
                                            break
                                        case 'email':
                                            sendEmail(item.contact, INFOMESSAGE, 'Нет трафика!')
                                            break
                                        case 'sms':
                                            sendSMS(item.contact, INFOMESSAGE)
                                            break
                                    }
                                }
                                hasntTraficInfoMessage == 3 ? hasntTraficInfoMessage = 1 : hasntTraficInfoMessage++;
                            })
                        }

                        
                    }

                } else {
                    currentInfoMessage = 1 //if mode is OFF reset info count
                }
            })
        }
    })
    // }); // CRON SHEDULE
}



module.exports = accountsMonitorig