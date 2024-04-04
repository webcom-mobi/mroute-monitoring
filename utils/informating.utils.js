const { bot, sendMessage } = require('../utils/bot.utils')
const nodemailer = require("nodemailer");
const WebcomApi = require('webcom-mobi-node')

const sendTG = function (chatID, message) {
    sendMessage(message, bot, chatID);
}

const sendSMS = function (phone, message) { 
    const app = new WebcomApi('monitoring', 'heG14hDJ')
    let phones = ['79044208261'] // Array of phones
    const optionSMS = {
        senderName: "WEBCOM MOBI",
        phones: phones,
        text: message
    }
    app.sendSMS(optionSMS).then((IDs)=> console.log(IDs))
}


const sendEmail = async function (email, message, title) { 
    const login = 'monitoring@webcom.mobi'
    const pass = 'swmafogrvmvkkduf'

    let transporter = nodemailer.createTransport({
        host: "smtp.yandex.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: login, // generated ethereal user
          pass: pass, // generated ethereal password
        },
    });

    await transporter.sendMail({
        from: '"Monitoring system 👻" <monitoring@webcom.mobi>', // sender address
        to: "work.dmitriy34@yandex.ru", // list of receivers
        subject: title, // Subject line
        text: message, // plain text body
        html: message, // html body
    });
}


module.exports = {sendTG, sendSMS, sendEmail }