const Router = require('express')
const router  = new Router()
const controller = require('../controllers/template.controller')
const { body } = require('express-validator');

router.get('/', controller.getAllTemplates)
router.get('/:id', controller.getTemplateById)
router.post('/add', controller.addTemplate)
router.post('/update/:id', controller.updateTemplate)
router.post('/delete/:id', controller.deleteTemplate)

module.exports = router