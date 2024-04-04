const db = require('../utils/db.utils')
const { validationResult } = require('express-validator')

const Agregators = require('../models/agregators.model')


class agregatorsController {

    async getAllAgregators(req, res) {
        try {
            const rows = await Agregators.findAll({ raw: true })
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Agregators error!" })
        }
    }


    async getAgregatorById(req, res) {
        try {
            const rows = await Agregators.findByPk(req.params.id)
            
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Agregators error!" })
        }
    }

    async addAgregatorToDB(req, res) {
        try {

            await Agregators.create(req.body)
            return res.status(200).json({message: 'Агрегатор добавлен'})

            
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Add Agregator error!" })
        }
    }


    async updateAgregatorInfo(req, res) {
        try {
            await Agregators.update( req.body, {
                where: {
                  id: req.body.id
                }
            })
            return res.status(200).json({message: 'Агрегатор Обновлен'})

            
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Update Agregator error!" })
        }
    }


    async  deleteAgregator(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Agregator ID is empty!" })
            }
            const deleted_rows = await Agregators.destroy({
                where: {
                    id: id
                }
            })
            return res.status(200).json(deleted_rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Delete agregator error!" })
        }
    }
}

module.exports = new agregatorsController()

