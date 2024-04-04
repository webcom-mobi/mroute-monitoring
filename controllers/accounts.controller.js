const db = require('../utils/db.utils')
const { validationResult } = require('express-validator')

const Accounts = require('../models/accounts.model')
const accountsMonitorig = require('../modules/account_monitoring')

class accountsController {
    async getAllAccounts(req, res) {
        try {
            const rows = await Accounts.findAll({ raw: true })
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get accounts error!" })
        }
    }


    async addAccount(req, res) {

            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message: `Ошибка при заполнении формы! `, errors})
            }
            try {
                const acc = await Accounts.create(req.body)
                res.status(200).json({message: 'Аккаунт успешно добавлен!', acc})
    
            } catch (e) {
                console.log(e)
            }
    }

    async toggleAccount(req, res) {
        try{
            const id = req.params.id
            const editObj = await Accounts.findByPk(id)
            let newStatus;
            editObj.isModerate == 'true' ? newStatus ='false' : newStatus = 'true'
            await Accounts.update({isModerate: newStatus }, {where: {id:id}})
            return res.status(200).json( {message: 'Update succesfull'});
        }catch(e){
            console.log(e)
            return res.status(400).json({ message: "Update account error!" })
        }
    }

    async deleteAccount(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Account ID is empty!" })
            }
            const deleted_rows = await Accounts.destroy({
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

    async getAccountById(req, res) {
        try {
            const rows = await Accounts.findByPk(req.params.id)
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get Account error!" })
        }
    }


    async updateAccount(req, res) {
        try {
            await Accounts.update( req.body, {
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

module.exports = new accountsController()

