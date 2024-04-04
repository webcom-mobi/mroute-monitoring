const fetch = require('node-fetch')
const convert = require('xml-js');

const {SMPP_BASE} = require('../config/app.config')
const LOGIN = 'route_bot'
const PASSWORD = 'Mn98rTi'


const headers = {
    'Content-Type': 'application/xml',
}

class smppController {

    //Получить соощения на модерации
    async moderate(req, res) {

        try {
            // const xmlbody = `
            //     <?xml version="1.0" encoding="utf-8" ?>
            //     <request>
            //     <security>
            //     <login value="${LOGIN}" />
            //     <password value="${PASSWORD}" />
            //     </security>
            //     <type_stat>moderation</type_stat>
            //     </request>            
            // `

            const xmlbody = `
                <?xml version="1.0" encoding="utf-8" ?>
                <request>
                <security>
                <login value="${LOGIN}" />
                <password value="${PASSWORD}" />
                </security>
                <type_stat>moderation_num_sms</type_stat>
                </request>            
            `

            const object = await fetchSMPPApi(xmlbody)

            
            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)            

        } catch (e) {
            // console.log(e)
            return res.status(400).json({message: "Get moderate message error!"})
        }
    }


    //Получить очередь из сообщений
    async queue(req, res) {

        try {
            const xmlbody = `
                <?xml version="1.0" encoding="utf-8" ?>
                <request>
                <security>
                <login value="${LOGIN}" />
                <password value="${PASSWORD}" />
                </security>
                <type_stat>sms_turn</type_stat>
                </request>            
            `

            const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }
            let accountSet = '';
            if (object.message.length != undefined) {
                object.message.forEach(item => {
                    accountSet = accountSet.includes(item._attributes.login) ? accountSet : `${accountSet} ${item._attributes.login};`;
                })
            }

            // return res.status(200).json({message: `В очереди ${object.message.length} сообщений`})
            return res.status(200).json({count: object.message.length != undefined ? object.message.length : 0, accounts: accountSet})


        } catch (e) {
            // console.log(e)
            // return res.status(400).json({message: "Get queue messages error!"})
        }
    }

    //Получить сообщения очереди с заглушкой id = 4
    async plugQueueCount(req, res) {

        try {
            const xmlbody = `
                <?xml version="1.0" encoding="utf-8" ?>
                <request>
                <security>
                <login value="${LOGIN}" />
                <password value="${PASSWORD}" />
                </security>
                <type_stat>sms_turn</type_stat>
                </request>            
            `

            const object = await fetchSMPPApi(xmlbody)


            if(object.error){
                return res.status(200).json({error: object.error})
            }

            const pluobj = object.message.filter(msg =>  msg._attributes.id_aggregating == 4 )
            return res.status(200).json(pluobj || [])
            // return res.status(200).json({message: `В очереди ${object.message.length} сообщений`})


        } catch (e) {
            // console.log(e)
            // return res.status(400).json({message: "Get queue messages error!"})
        }
    }


    //Скорость приема, отправки, sms в очереди
    async params(req, res) {
        try {
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>send_speed_sms</type_stat>
            </request>            
        `

        const object = await fetchSMPPApi(xmlbody)

        if(object.error){
            return res.status(200).json({error: object.error})
        }
        return res.status(200).json(object)            

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get params info error!"})
        }
    }

    //Получить состояния агрераторов
    async agregators(req, res){
        try {
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>stat_aggregating</type_stat>
            </request>            
        `

        const object = await fetchSMPPApi(xmlbody)

        if(object.error){
            return res.status(200).json({error: object.error})
        }
        return res.status(200).json(object)            

        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get agregators info error!"})
        }
    }

    //Получение статистики
    async stats(req, res) {        

        try {
            const fullDate = new Date()
            let month = fullDate.getMonth() + 1 //Нумерация начинается с 0 поэтому +1
            let year = fullDate.getFullYear()
            month < 10 ? month = '0'+month : month
            let day = fullDate.getUTCDate()
            day < 10 ? day = '0'+day : day

            const dateForRequest = `${year}-${month}-${day}`
            console.log(`Current date (from smpp.controlle.js): `+dateForRequest);
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>state_from_time</type_stat>
            <hour>FALSE</hour>
            <day>TRUE</day>
            <client>FALSE</client>
            <originator>FALSE</originator>
            <country>FALSE</country>
            <operator>FALSE</operator>
            <channel>TRUE</channel>
            <type_send>FALSE</type_send>
            <manager>FALSE</manager>
            <get_period date_start="${dateForRequest}"  date_stop="${dateForRequest}"   local_time="0" />
            </request>  
        `

        

            const response  = await fetch(SMPP_BASE, {
                method: 'POST',
                headers: headers,
                body: xmlbody
            })


            const xmlresponse = await response.text()

            const json = convert.xml2json(xmlresponse, {compact: true, spaces: 4});

            const object = JSON.parse(json).response;
    
            // const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)  
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }


    //Получение статистики
    async accountsStats(req, res) {  
            

        try {
            const fullDate = new Date()
            let month = fullDate.getMonth() + 1 //Нумерация начинается с 0 поэтому +1
            let year = fullDate.getFullYear()
            month < 10 ? month = '0'+month : month
            let day = fullDate.getUTCDate()
            day < 10 ? day = '0'+day : day

            const dateForRequest = `${year}-${month}-${day}`
            console.log(`Current date (from smpp.controlle.js): `+dateForRequest);
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>state_from_time</type_stat>
            <hour>FALSE</hour>
            <day>TRUE</day>
            <client>TRUE</client>
            <originator>TRUE</originator>
            <country>TRUE</country>
            <operator>TRUE</operator>
            <channel>FALSE</channel>
            <type_send>FALSE</type_send>
            <manager>FALSE</manager>
            <get_period date_start="${dateForRequest}"  date_stop="${dateForRequest}"   local_time="0" />
            </request>  
        `

        

            const response  = await fetch(SMPP_BASE, {
                method: 'POST',
                headers: headers,
                body: xmlbody
            })


            const xmlresponse = await response.text()

            const json = convert.xml2json(xmlresponse, {compact: true, spaces: 4});

            const object = JSON.parse(json).response;
    
            // const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }

            //filter need account 
            const ac_id = req.query.id
            if (!ac_id) {
                return res.status(400).json({message: "Get stats error!"})
            } else {
                const filteredAccount = object.stat.filter(item => item._attributes.id_user == ac_id)
                return res.status(200).json(filteredAccount)  
            }
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }


    //Получение статистики
    async hourlyAccountsStats(req, res) {  
        try {
            const fullDate = new Date()
            let month = fullDate.getMonth() + 1 //Нумерация начинается с 0 поэтому +1
            let year = fullDate.getFullYear()
            month < 10 ? month = '0'+month : month
            let day = fullDate.getUTCDate()
            day < 10 ? day = '0'+day : day

            const dateForRequest = `${year}-${month}-${day}`
            console.log(`Current date (from smpp.controlle.js): `+dateForRequest);
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>state_from_time</type_stat>
            <hour>TRUE</hour>
            <day>TRUE</day>
            <client>TRUE</client>
            <originator>TRUE</originator>
            <country>TRUE</country>
            <operator>TRUE</operator>
            <channel>FALSE</channel>
            <type_send>FALSE</type_send>
            <manager>FALSE</manager>
            <get_period date_start="${dateForRequest}"  date_stop="${dateForRequest}"   local_time="0" />
            </request>  
        `

        

            const response  = await fetch(SMPP_BASE, {
                method: 'POST',
                headers: headers,
                body: xmlbody
            })


            const xmlresponse = await response.text()

            const json = convert.xml2json(xmlresponse, {compact: true, spaces: 4});

            const object = JSON.parse(json).response;
    
            // const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }

            //filter need account 
            const ac_id = req.query.id
            if (!ac_id) {
                return res.status(400).json({message: "Get stats error!"})
            } else {
                const filteredAccount = object.stat.filter(item => item._attributes.id_user == ac_id)
                return res.status(200).json(filteredAccount)  
            }
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }


    async hourlyStatsByAgregator(req, res) {        

        try {
            const fullDate = new Date()
            let month = fullDate.getMonth() + 1 //Нумерация начинается с 0 поэтому +1
            let year = fullDate.getFullYear()
            month < 10 ? month = '0'+month : month
            let day = fullDate.getUTCDate()
            day < 10 ? day = '0'+day : day

            const agregatorName = req.query.name

            const dateForRequest = `${year}-${month}-${day}`
            console.log(`Current date (from smpp.controlle.js): `+dateForRequest);
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>state_from_time</type_stat>
            <hour>TRUE</hour>
            <day>TRUE</day>
            <client>FALSE</client>
            <originator>FALSE</originator>
            <country>FALSE</country>
            <operator>FALSE</operator>
            <channel>TRUE</channel>
            <type_send>FALSE</type_send>
            <manager>FALSE</manager>
            <get_period date_start="${dateForRequest}"  date_stop="${dateForRequest}"   local_time="0" />
            </request>  
        `

        

            const response  = await fetch(SMPP_BASE, {
                method: 'POST',
                headers: headers,
                body: xmlbody
            })


            const xmlresponse = await response.text()

            const json = convert.xml2json(xmlresponse, {compact: true, spaces: 4});

            const object = JSON.parse(json).response;
    
            // const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)  
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }


    async hourlyStatsBySender(req, res) {        

        try {
            const fullDate = new Date()
            let month = fullDate.getMonth() + 1 //Нумерация начинается с 0 поэтому +1
            let year = fullDate.getFullYear()
            month < 10 ? month = '0'+month : month
            let day = fullDate.getUTCDate()
            day < 10 ? day = '0'+day : day

            const agregatorName = req.query.name

            const dateForRequest = `${year}-${month}-${day}`
            console.log(`Current date (from smpp.controlle.js): `+dateForRequest);
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>state_from_time</type_stat>
            <hour>TRUE</hour>
            <day>TRUE</day>
            <client>FALSE</client>
            <originator>TRUE</originator>
            <country>TRUE</country>
            <operator>FALSE</operator>
            <channel>TRUE</channel>
            <type_send>FALSE</type_send>
            <manager>FALSE</manager>
            <get_period date_start="${dateForRequest}"  date_stop="${dateForRequest}"   local_time="0" />
            </request>  
        `

        

            const response  = await fetch(SMPP_BASE, {
                method: 'POST',
                headers: headers,
                body: xmlbody
            })



            const xmlresponse = await response.text()

            const json = convert.xml2json(xmlresponse, {compact: true, spaces: 4});


            const object = JSON.parse(json).response;
    



            // const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)  
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }


    
    async dailyStatsBySender(req, res) {        

        try {
            const fullDate = new Date()
            let month = fullDate.getMonth() + 1 //Нумерация начинается с 0 поэтому +1
            let year = fullDate.getFullYear()
            month < 10 ? month = '0'+month : month
            let day = fullDate.getUTCDate()
            day < 10 ? day = '0'+day : day

            const agregatorName = req.query.name

            const dateForRequest = `${year}-${month}-${day}`
            console.log(`Current date (from smpp.controlle.js): `+dateForRequest);
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>state_from_time</type_stat>
            <hour>FALSE</hour>
            <day>TRUE</day>
            <client>FALSE</client>
            <originator>TRUE</originator>
            <country>FALSE</country>
            <operator>TRUE</operator>
            <channel>TRUE</channel>
            <type_send>FALSE</type_send>
            <manager>FALSE</manager>
            <get_period date_start="${dateForRequest}"  date_stop="${dateForRequest}"   local_time="0" />
            </request>  
        `

        

            const response  = await fetch(SMPP_BASE, {
                method: 'POST',
                headers: headers,
                body: xmlbody
            })


            const xmlresponse = await response.text()

            const json = convert.xml2json(xmlresponse, {compact: true, spaces: 4});

            const object = JSON.parse(json).response;
    
            // const object = await fetchSMPPApi(xmlbody)
            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)  
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }

    async getBalance(req, res) {        

        try {
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>balance</type_stat>
            </request>            
        `

            const object = await fetchSMPPApi(xmlbody)

            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)   
    
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }


    async getDistribution_archive(req, res) {
        try {
            const xmlbody = `
            <?xml version="1.0" encoding="utf-8" ?>
            <request>
            <security>
            <login value="${LOGIN}" />
            <password value="${PASSWORD}" />
            </security>
            <type_stat>distribution_archive</type_stat>
            </request>            
        `

            const object = await fetchSMPPApi(xmlbody)

            if(object.error){
                return res.status(200).json({error: object.error})
            }
            return res.status(200).json(object)   
    
        } catch (e) {
            console.log(e)
            return res.status(400).json({message: "Get stats error!"})
        }
    }

}





//Обертка для запросов к АПИ SMPP системы
async function fetchSMPPApi(xml){
    const response  = await fetch(SMPP_BASE, {
        method: 'POST',
        headers: headers,
        body: xml
    })

    const xmlresponse = await response.text()

    // const json = xmlresponse ? convert.xml2json(xmlresponse, {compact: true, spaces: 4}) : ''
    const json = xmlresponse ? convert.xml2json(xmlresponse, {compact: true}) : ''
    const object = await JSON.parse(json).response;
    return object
}


module.exports = new smppController()