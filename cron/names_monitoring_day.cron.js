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
        const {data: statisticFromApiFull} = await axios.get(API_BASE + '/smpp/dailysenderstats')
        const statsData = statisticFromApiFull.stat;




        let message = `<b>3 Server Daily reg message stats!</b>
        `;

        const mncArray = statsData.map(i=>i._attributes.MNC_title)
        const mncSet = Array.from(new Set(mncArray));

        const resultArray=[]

        NAMES.forEach(currentName => {



            const names = currentName.names;
            const nameAggregatinStats = statsData.filter(item=>names.includes(item._attributes.originator));

            mncSet.forEach(mnc=> {
                const mccStats = nameAggregatinStats.filter(i=>i._attributes.MNC_title === mnc)
                const reduceAllCount =  +mccStats.reduce((accumulator, curItem) => +accumulator + (+curItem._attributes.send), 0)

                const specStat = mccStats.filter(item=>SPEC_NAMES.includes(item._attributes.id_aggregating))
                const reduceSpecCount = +specStat.reduce((accumulator, curItem) => +accumulator + (+curItem._attributes.send), 0)

                if(reduceAllCount > 0) {
                    resultArray.push({
                        title: currentName.title,
                        mnc: mnc,
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
<b>${item.title}</b> ${item.mnc} - organic: ${organic} / spec: ${item.spec}  (${Math.round(persent)}%)`
        })


        const accumulateSpec = resultArray.reduce((acc, curItem) => +acc+(+curItem.spec), 0)

        const accumulateTotal =  resultArray.reduce((acc, curItem) => +acc+(+curItem.total), 0) - accumulateSpec;

        message+=`

<b>Daily stat: organic - ${accumulateTotal-accumulateSpec} / spec - ${accumulateSpec}</b>
 `
        console.log(message);
        sendMessage(message, bot,CHAT_ID);        

    });
}