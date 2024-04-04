const Router = require('express')
const router  = new Router()
const controller = require('../controllers/informating.controller')

router.get('/', controller.getAllInformating)
router.get('/:id', controller.getInformatingById)
router.post('/add', controller.addInformating)
router.post('/update/:id', controller.updateInformating)
router.post('/delete/:id', controller.deleteInformating)

module.exports = router