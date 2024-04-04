const Router = require('express')
const router  = new Router()
const controller = require('../controllers/agregators.controller')

router.get('/', controller.getAllAgregators)
router.get('/:id', controller.getAgregatorById)
router.post('/add', controller.addAgregatorToDB)
router.post('/update', controller.updateAgregatorInfo)
router.post('/delete/:id', controller.deleteAgregator)


module.exports = router 