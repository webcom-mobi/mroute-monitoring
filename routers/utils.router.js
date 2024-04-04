const Router = require('express')
const router  = new Router()
const controller = require('../controllers/utils.controller')

router.get('/reboot', controller.rebootSystem)

module.exports = router