const Router = require('express')
const router = new Router()
const controller = require('../controllers/auth.controller')
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth.middleware')
const roleMiddleware = require('../middleware/role.middleware')


router.post('/registration',
    [
        body('email').isEmail().withMessage('Некорректный Email'),
        body('login').isLength({ min: 4 }).withMessage('Минимальная длина 4 символа'),
        body('password').isLength({ min: 4 }).withMessage('Минимальная длина 4 символа')
    ],
    controller.registration)
router.post('/login', controller.login)
// router.get('/users',roleMiddleware('admin'), controller.getUsers)
router.get('/users', controller.getUsers)
router.post('/fetchinfo', controller.fetchinfo)


module.exports = router