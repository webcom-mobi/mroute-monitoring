const { Telegraf, Markup } = require('telegraf')
const fs = require('fs');
const path = require('path')

const axios = require('axios')
const { API_BASE } = require('../config/app.config')


const bot = new Telegraf(process.env.BOT_TOKEN)


bot.start((ctx) => {
    ctx.reply('Добро пожаловать. Меня зовут Иннокентий! Я бот , который немного облегчит вам жизнь. Команда /sub подпишет вас на уведомления')
})


bot.command('/sub', (ctx) => {
    let subInfo = {
        "name": ctx.message.from.first_name,
        "chatID": ctx.update.message.chat.id,
    }
    try {
        const tempRaw = fs.readFileSync(path.join(__dirname, '../temp/users.json')) // JSON 
        let tempJson = JSON.parse(tempRaw);
        tempJson.push(subInfo)
        fs.writeFileSync(path.join(__dirname, '../temp/users.json'), JSON.stringify(tempJson))
        ctx.reply(`Привет, ${ctx.message.from.first_name}. Теперь ты подписан на бота.`)
    } catch (e) {
        console.log(e);
        ctx.reply(`Привет, ${ctx.message.from.first_name}. Произошла ошибка. Попробуй еще раз.`)
    }

});

bot.command('/unsub', (ctx) => {
    try {
        const chatID = ctx.update.message.chat.id
        const tempRaw = fs.readFileSync(path.join(__dirname, '../temp/users.json')) // JSON 
        let tempJson = JSON.parse(tempRaw);
        let newJson = tempJson.filter(user => user['chatID'] != chatID)
        fs.writeFileSync(path.join(__dirname, '../temp/users.json'), JSON.stringify(newJson))
        ctx.reply(`Дорогой, ${ctx.message.from.first_name}. Теперь ты отписан от бота.`)

    } catch (e) {
        console.log(e);
        ctx.reply(`Дорогой, ${ctx.message.from.first_name}. Произошла ошибка. Попробуй еще раз.`)
    }
});


bot.hears(/^\/hourly\s(\S+)$/, async ctx => {
    const agregatorName = ctx.message.text.split(' ')[1]
    if (agregatorName) {
        const msg = await generateHourlyStat(agregatorName)
        if(msg != ''){
            ctx.replyWithHTML(msg)
        } else{
            ctx.reply(`Дорогой, ${ctx.message.from.first_name}. Произошла ошибка. Попробуй еще раз.`)
        }


    } else {
        ctx.reply(`Дорогой, ${ctx.message.from.first_name}. Произошла ошибка. Попробуй еще раз.`)
    }
})


//Запрос параметров агрегатора
bot.hears(/^\/get_stat\s(\S+)$/, async ctx => {
    const agregatorName = ctx.message.text.split(' ')[1]
    const allAgregators = await axios.get(API_BASE + '/agregators/')
    const current_agregatorInOurSystem = allAgregators.data.find(item => item.name === agregatorName)

    if (current_agregatorInOurSystem) {
        let msg = `
Параметры агрегатора <strong>  ${agregatorName}</strong>  
=====================================================
System ID: <strong>  ${current_agregatorInOurSystem.systemId}</strong>  
Описание:  <strong>${current_agregatorInOurSystem.description}</strong> 
Провайдер:  <strong>${current_agregatorInOurSystem.provider}</strong> 
Тип:  <strong>${current_agregatorInOurSystem.type}</strong> 
Эталон:  <strong>${current_agregatorInOurSystem.etalon} %</strong> 
Мин. %:  <strong>${current_agregatorInOurSystem.min_persent} %</strong> 
Макс. %:  <strong>${current_agregatorInOurSystem.max_persent} %</strong> 
Мин. объем:  <strong>${current_agregatorInOurSystem.min_volume}</strong> 
В работе:   <strong>${current_agregatorInOurSystem.works ? 'Да' : 'Нет'}</strong> 

Email:  <strong>${current_agregatorInOurSystem.email}</strong> 
TG:  <strong>${current_agregatorInOurSystem.telegram}</strong> 
        `
        if(msg != ''){
            ctx.replyWithHTML(msg)
        } else{
            ctx.reply(`Дорогой, ${ctx.message.from.first_name}. Произошла ошибка. Попробуй еще раз.`)
        }


    } else {
        ctx.reply(`Дорогой, ${ctx.message.from.first_name}. Произошла ошибка. Попробуй еще раз.`)
    }
})



bot.launch()


const sendMessage = async function (msg, bot, channelID ) {

   if (process.env.SEND_MSG == 1) {
    const chatlID = channelID ?  channelID :  -709501698
    for (const part of chunk(msg, 3000))
		//  ctx.sendMessage(part);
        await bot.telegram.sendMessage(chatlID, part, { parse_mode: 'HTML' })
   }
}


bot.command('/test', ctx => {
    return ctx.reply('bringo_dir - за час', {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          Markup.button.callback('Да', 'freshStat'),
        ])
    })
})


bot.command('/brokenaggr', async ctx => {
let message = `
<strong> Агрегаторы с  % доставки менее 70: </strong> 
`;
const state = await axios.get(API_BASE + '/smpp/stats')
state.data.stat.forEach(async (agr) => { 
    if(agr._attributes.deliver_p < 70) {
        message+=
` ${agr._attributes.id_aggregating} <strong>(${agr._attributes.deliver_p}%)</strong>
`
    }
})


    ctx.replyWithHTML(message)
})



bot.action('freshStat', async (ctx) => {
    const agregatorName = ctx.update.callback_query.message.text.split(' - ')[0];
    const msg = await generateHourlyStat(agregatorName)
    if(msg != ''){
        ctx.replyWithHTML(msg)
    } else{
        ctx.reply(`Произошла ошибка. Попробуй еще раз.`)
    }
});


const generateHourlyStat = async (agregator)  => {
    
        const request = await axios.get(API_BASE + `/smpp/hourlystats?name=${agregator}`)
        const neededAgr = request.data.stat.filter(agr => agr._attributes.id_aggregating == agregator)
        const lashHourlyStat = neededAgr[0] || null
        const agregators = await axios.get(API_BASE + '/agregators/')
        const current_agregatorInOurSystem = agregators.data.find(item => item.name === agregator)


        if (lashHourlyStat) {
           return  `
Агрегатор: <strong>${agregator}</strong>  
SYSTEM_ID: <strong>${current_agregatorInOurSystem.systemId}</strong>         
Время - ${lashHourlyStat._attributes.hours + ' (за час)' || '(за сутки)' } 
------------------
ВСЕГО СМС:  <b>${lashHourlyStat._attributes.send}</b>
------------------
Доставлено: <b>${lashHourlyStat._attributes.deliver} (${lashHourlyStat._attributes.deliver_p}%)</b> 
Не доставлено: <b>${lashHourlyStat._attributes.not_deliver}</b>
Прочитано: <b>${lashHourlyStat._attributes.read} (${lashHourlyStat._attributes.read_p}%)</b> 
В процессе: <b>${lashHourlyStat._attributes.partly_deliver}</b> 
Просрочено: <b>${lashHourlyStat._attributes.expired}</b> 
Для получения информации о канале, пропишите:  /get_stat ${agregator}
`;
       
    } else {
        return ''
    }
}


const sendStateMessageWithButton = function (msg, bot, agrName) {

    const channelID = -709501698
    bot.telegram.sendMessage(channelID, msg, { parse_mode: 'HTML' })
    bot.telegram.sendMessage(channelID,`${agrName} - за час`, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          Markup.button.callback('Да', 'freshStat'),
        ])
    })
}

const chunk = (str, size) =>
  Array.from({ length: Math.ceil(str.length / size) }, (v, i) =>
    str.slice(i * size, i * size + size)
  );

module.exports = { bot, sendMessage , sendStateMessageWithButton, chunk}