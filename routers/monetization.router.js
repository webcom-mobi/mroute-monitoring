const Router = require('express')
const router  = new Router()
const controller = require('../controllers/monetization.controller')
const { body } = require('express-validator');

router.get('/', controller.getAllmonetizations)
router.get('/:id', controller.getMonetizationById)

router.post('/add',[
    body('login').isLength({ min: 3 }).withMessage('This field can`t be empty!')
], controller.addMonetization)

//Обновить статус модерации 
router.post('/togglestatus/:id', controller.toggleMonetizationStatus)

router.post('/update/', controller.updateMonetization)
//Удалить тикет
router.post('/delete/:id', controller.deleteMOnetization)

module.exports = router