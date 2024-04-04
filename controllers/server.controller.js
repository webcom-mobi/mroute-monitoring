const fetch = require('node-fetch')

const {VDStoken} = require('../config/app.config')
const BASE_URL = 'https://api.selectel.ru/servers/v2'
const headers = {
    "Content-Type": "application/json",
    "X-token" : VDStoken
   }


async function getUIID() {
    try{
        const response = await fetch(`${BASE_URL}/location`,{
            method: 'GET',
            headers: headers
        })
        const json = await response.json()
        const uiid = json.result.uiid
        return uiid
    }catch(e){
        console.log(e);
    }
}

class serverController {
    //Get maintenance status 
    async maintenance(req, res) {
        try {
           const response = await fetch(`${BASE_URL}/dashboard/maintenance`,{
               method: 'GET',
               headers: headers
           })
           const responceJSON = await response.json()
           res.status(200).json(responceJSON)

            
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Get server status error!'})
        }
    }

    //Get resource speed
    async resourcespeed(req, res) {
        try {
            const uiid = await getUIID()
        } catch (e) {
            console.log(e);
            res.status(400).json({message: 'Get rsource speed error!'})

        }
    }


}

module.exports = new serverController()