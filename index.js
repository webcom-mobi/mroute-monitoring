const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
//Routing
const authRouter = require('./routers/auth.router')
const serverRouter = require('./routers/server.router')
const smppRouter = require('./routers/smpp.router')
const ticketRouter = require('./routers/ticket.router')
const configRouter = require('./routers/config.router')
const accountsRouter = require('./routers/accounts.router')
const agregatorsRouter = require('./routers/agregators.router')
const templateRouter = require('./routers/template.router')
const informatingRouter = require('./routers/informating.router')
const monetizationRouter = require('./routers/monetization.router')
const utilsRouter = require('./routers/utils.router')


const PORT = process.env.PORT || 8082

const cronFunctions = require('./cron')
const { bot, sendMessage , sendStateMessageWithButton} = require('./utils/bot.utils')
const accountsMonitorig = require('./modules/account_monitoring')
const { sendTG, sendSMS, sendEmail } = require('./utils/informating.utils')


const app = express() 
app.use(cors());
//app.options("*", cors()); // include before other routes

app.use(express.json())
app.use('/auth' , authRouter)
app.use('/server', serverRouter)
app.use('/smpp', smppRouter)
app.use('/ticket', ticketRouter)
app.use('/config', configRouter)
app.use('/acc', accountsRouter)
app.use('/agregators', agregatorsRouter)
app.use('/template', templateRouter)
app.use('/informating', informatingRouter)
app.use('/monetization', monetizationRouter)
app.use('/utils', utilsRouter)





//const temmpFunc = require('./cron/agregators.cron')

const start = () => {
    try{
        app.listen(PORT, () => {            
           console.log(`Server is started on PORT: ${PORT}`)
            cronFunctions()
            accountsMonitorig()
            // monetizationModule()

        })
    } catch(e) {
        console.log(e)
    }
}

start()