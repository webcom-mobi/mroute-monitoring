const Router = require('express')
const router  = new Router()
const controller = require('../controllers/accounts.controller')
const { body } = require('express-validator');

router.get('/', controller.getAllAccounts)
router.get('/:id', controller.getAccountById)

router.post('/add',[
    body('login').isLength({ min: 3 }).withMessage('This field can`t be empty!')
], controller.addAccount)

//Обновить статус модерации 
router.post('/togglestatus/:id', controller.toggleAccount)

router.post('/update/', controller.updateAccount)
//Удалить тикет
router.post('/delete/:id', controller.deleteAccount)

module.exports = router