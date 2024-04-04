const axios = require('axios')
const { API_BASE } = require('../config/app.config')


//Функция создания тикета по объекту
const generateTicket = async function(ticket) {
    try{
        await  axios.post(API_BASE + '/ticket/add', ticket)
    }catch(e){
        console.log(e);
    }
}



module.exports = {
    generateTicket
}