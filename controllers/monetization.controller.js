const db = require('../utils/db.utils')
const { validationResult } = require('express-validator')

const Monetization = require('../models/monetization.model')

class monetizationController {
    async getAllmonetizations(req, res) {
        try {
            const rows = await Monetization.findAll({ raw: true })
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get accounts error!" })
        }
    }


    async addMonetization(req, res) {

            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message: `Ошибка при заполнении формы! `, errors})
            }
            try {
                const acc = await Monetization.create(req.body)
                res.status(200).json({message: 'Аккаунт успешно добавлен!', acc})
    
            } catch (e) {
                console.log(e)
            }
    }

    async toggleMonetizationStatus(req, res) {
        try{
            const id = req.params.id
            const editObj = await Monetization.findByPk(id)
            let newStatus;
            editObj.isActive == 'true' ? newStatus ='false' : newStatus = 'true'
            await Monetization.update({isActive: newStatus }, {where: {id:id}})
            return res.status(200).json( {message: 'Update succesfull'});
        }catch(e){
            console.log(e)
            return res.status(400).json({ message: "Update account error!" })
        }
    }

    async deleteMOnetization(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Account ID is empty!" })
            }
            const deleted_rows = await Monetization.destroy({
                where: {
                    id: id
                }
            })
            return res.status(200).json(deleted_rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Delete account error!" })
        }
    }

    async getMonetizationById(req, res) {
        try {
            const rows = await Monetization.findByPk(req.params.id)
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Account error!!" })
        }
    }


    async updateMonetization(req, res) {
        try {
            await Monetization.update( req.body, {
                where: {
                  id: req.body.id
                }
            })
            return res.status(200).json({message: 'Аккаунт Обновлен'})
            
        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Update Agregator error!" })
        }
    }
}

module.exports = new monetizationController()

