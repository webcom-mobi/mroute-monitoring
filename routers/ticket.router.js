const Router = require('express')
const router  = new Router()
const controller = require('../controllers/ticket.controller')
const { body } = require('express-validator');

//Получить все тикеты по base_name
router.get('/', controller.getAllTickets)

//Получить все тикеты по конкретному пользователю
router.get('/:id', controller.getTicketByUser)

//Добавить тикет
router.post('/add',[
    body('content').isLength({ min: 4 }).withMessage('This field can`t be empty!')
], controller.addTicket)

//Обновить тикет
router.post('/update/:id', controller.updateTicket)

//Удалить тикет
router.post('/delete/:id', controller.deleteTicket)

//Закрыть тикет
router.post('/close/:id', controller.closeTicket)


//Закрепить тикет
router.post('/setResp', controller.setResp)

module.exports = router