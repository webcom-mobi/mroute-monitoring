const db = require('../utils/db.utils')
const { validationResult } = require('express-validator')

const Informating = require('../models/informating.model')


class informatingController {

    async getAllInformating(req, res) {
        try {
            const rows = await Informating.findAll({ raw: true })
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Informating error!" })
        }
    }

    async getInformatingById(req, res) {
        try {
            const rows = await Informating.findAll({
                where: {
                    user_id: req.params.id
                }
            })
            
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Template error!" })
        }
    }

    async addInformating(req, res) {
        try {
            const InformatingItem = await Informating.create(req.body)       
            res.status(200).json(InformatingItem)
        } catch (e) {
            console.log(e)
        }
    }
    
    async updateInformating(req, res) {
        try {
            await Informating.update( req.body, {
                where: {
                  id: req.body.id
                }
            })
            return res.status(200).json({message: 'Informating Обновлен'})

            
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Update Informating error!" })
        }
    }

    async deleteInformating(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Informating ID is empty!" })
            }
            const deleted_rows = await Informating.destroy({
                where: {
                    id: id
                }
            })
            return res.status(200).json(deleted_rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Delete Informating error!" })
        }
    }

}


module.exports = new informatingController()
