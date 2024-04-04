const Router = require('express')
const router = new Router()
const controller = require('../controllers/server.controller')

router.get('/maintenance', controller.maintenance)
router.get('/resourcespeed', controller.resourcespeed)




module.exports = router;