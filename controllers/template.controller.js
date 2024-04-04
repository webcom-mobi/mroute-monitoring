const db = require('../utils/db.utils')
const { validationResult } = require('express-validator')

const Template = require('../models/template.model')


class templateController {

    async getAllTemplates(req, res) {
        try {
            const rows = await Template.findAll({ raw: true })
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get template error!" })
        }
    }

    async getTemplateById(req, res) {
        try {
            const rows = await Template.findByPk(req.params.id)
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Template error!" })
        }
    }

    async addTemplate(req, res) {
        try {
            const {title, content} = req.body
            const template = await Template.create({
                title,
                content,
            })
            
            res.status(200).json({message: 'Шаблон успешно добавлен!', template})

        } catch (e) {
            console.log(e)
        }
    }
    
    async updateTemplate(req, res) {
        try {
            await Template.update( req.body, {
                where: {
                  id: req.body.id
                }
            })
            return res.status(200).json({message: 'Template Обновлен'})

            
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Update Template error!" })
        }
    }

    async deleteTemplate(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Template ID is empty!" })
            }
            const deleted_rows = await Template.destroy({
                where: {
                    id: id
                }
            })
            return res.status(200).json(deleted_rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Delete Template error!" })
        }
    }

}


module.exports = new templateController()
