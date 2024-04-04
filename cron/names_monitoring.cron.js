const cron = require('node-cron')
const axios = require('axios')
const { API_BASE } = require('../config/app.config')
const { bot, sendMessage, chunks } = require('../utils/bot.utils')
const namesJSON = require('../json/names.json')



module.exports = (cronString) => {
    cron.schedule(cronString, async function () {
        const SPEC_NAMES = ['SPEC', 'SPEC_2']
        const NAMES = namesJSON.items;
        const CHAT_ID = -4011747496;
        const {data: statisticFromApiFull} = await axios.get(API_BASE + '/smpp/hoursenderstats')
        const statsData = statisticFromApiFull.stat;


        //Костыль для исключения 0 часа из проверки.
        const CLIENT_HOUR = new Date().getHours()
        if(CLIENT_HOUR < 4) {
            return;
        }
        //-------

        let reqHours = new Date().getHours() - 4 // UTC 
        reqHours = reqHours < 10 ? reqHours = '0' + reqHours : reqHours;
        const CURRENT_HOUR_DATA  = statsData.filter(item => item._attributes.hours.split(' ')[1] == `${reqHours}:00`)

        let message = `<b>3 Server Reg message stats (${reqHours}:00 - ${+reqHours+1}:00 UTC0 )</b>
        `;

        const mccArray = CURRENT_HOUR_DATA.map(i=>i._attributes.MCC_title)
        const mccSet = Array.from(new Set(mccArray));

        const resultArray=[]

        NAMES.forEach(currentName => {



            const names = currentName.names;
            const nameAggregatinStats = CURRENT_HOUR_DATA.filter(item=>names.includes(item._attributes.originator));

            mccSet.forEach(mcc=> {
                const mccStats = nameAggregatinStats.filter(i=>i._attributes.MCC_title === mcc)
                const reduceAllCount =  +mccStats.reduce((accumulator, curItem) => +accumulator + (+curItem._attributes.send), 0)

                const specStat = mccStats.filter(item=>SPEC_NAMES.includes(item._attributes.id_aggregating))
                const reduceSpecCount = +specStat.reduce((accumulator, curItem) => +accumulator + (+curItem._attributes.send), 0)

                if(reduceAllCount > 0) {
                    resultArray.push({
                        title: currentName.title,
                        mcc: mcc,
                        total: reduceAllCount,
                        spec: reduceSpecCount
                    })
                }
            })
        })


        resultArray.sort((a, b) => {
            return b.total - a.total;
        });


        resultArray.forEach(item=> {


            const organic = item.total-item.spec;
            const persent = item.spec === 0 ? 0 : organic === 0 ? 100 : item.spec / organic * 100;


            message += `
<b>${item.title}</b> ${item.mcc} - organic: ${organic} / spec: ${item.spec}  (${Math.round(persent)}%)`
        })


        const accumulateTotal =  resultArray.reduce((acc, curItem) => +acc+(+curItem.total), 0)
        const accumulateSpec = resultArray.reduce((acc, curItem) => +acc+(+curItem.spec), 0)

        message+=`

<b>Hourly stat: organic - ${accumulateTotal-accumulateSpec} / spec - ${accumulateSpec}</b>
 `
        sendMessage(message, bot,CHAT_ID);        

    });
}