const cron = require('node-cron')

const queueCron = require('./queue.cron') //Задача модерации очереди
const agrCron = require('./stats.cron') //Задача модерации агрегаторов
const moderateCron = require('./new-moderate.cron') //Задача модерации 
const agrStateCron = require('./agregators.cron') //Задача модерации 
const resetError = require('./clearError.cron') //Задача очистки ошибок 
const balanceCron = require('./balance.cron') //Задача очистки ошибок 


const distribution_archive = require('./distribution_archive.cron') //Лог резервирования пулов

const daily_limit = require('./daily_limit.cron') //Лог проверки ежедневного лимита
const daily_limit_account = require('./daily_limit_account.cron') //Лог проверки ежедневного лимита аккаунтов


const names_monitoring_Cron = require('./names_monitoring.cron') 
const names_monitoring_daily_cron = require('./names_monitoring_day.cron')


module.exports = () => {
    daily_limit('59 * * * *')
    daily_limit_account('59 * * * *')
    queueCron('*/5 * * * *') 
    agrCron('*/5 * * * *')
    moderateCron('*/15 * * * *')
    agrStateCron('* * * * *')
    balanceCron('59 * * * *')
    resetError('59 23 * * *')


    //Ранее было закоменнтированно
     // distribution_archive('*/10 * * * *')
    // resetError('59 23 * * *')


    names_monitoring_Cron('0 * * * *');
    names_monitoring_daily_cron('02 09 * * *');
    names_monitoring_daily_cron('02 17 * * *');
} 