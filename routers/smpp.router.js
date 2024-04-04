const Router = require('express')
const router = new Router()
const controller = require('../controllers/smpp.controller')

router.get('/moderate', controller.moderate)
router.get('/queue', controller.queue)
router.get('/agregators', controller.agregators)
router.get('/stats', controller.stats)
router.get('/accountsStats', controller.accountsStats) // ?id=accout_name
router.get('/params', controller.params)
router.get('/hourlystats', controller.hourlyStatsByAgregator)
router.get('/plugqueuecount', controller.plugQueueCount)
router.get('/hourlyaccountstats',controller.hourlyAccountsStats)
router.get('/balance', controller.getBalance)
router.get('/distribution_archive', controller.getDistribution_archive)
router.get('/hoursenderstats', controller.hourlyStatsBySender)
router.get('/dailysenderstats', controller.dailyStatsBySender)



module.exports = router