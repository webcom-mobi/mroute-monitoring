const db = require('../utils/db.utils')
const { validationResult } = require('express-validator')

const Tickets = require('../models/ticket.model')
const User = require('../models/user.model')

class ticketController {

    //Получить все тикеты
    //TODO: Должна быть проверка на BASE_URL, что бы получать тикеты только конкретного кабинета 
    //Получать из токена по user_id
    async getAllTickets(req, res) {
        try {
            const rows = await Tickets.findAll({ raw: true })
            return res.status(200).json(rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get tickets error!" })
        }
    }

    //Получить все тикеты закрепленные за пользователем
    //TODO: Должна быть проверка на BASE_URL, что бы получать тикеты только конкретного кабинета 
    //Получать из токена по user_id
    async getTicketByUser(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "User ID is empty!" })
            }
            const tickets = await Tickets.findAll({ where: { Responsible_ID: id }, raw: true })
            return res.status(200).json(tickets)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Get tickets by user error!" })
        }
    }

    //Добавить Тикет
    async addTicket(req, res) {
        try {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ message: `Ошибка при заполнении формы! `, errors })
            }

            const { content } = req.body

            const ticket = await Tickets.create({
                content: content,
                status: 'new'
            })

            res.status(200).json({ message: 'Тикет успешно создан!', ticket })

        } catch (e) {
            return res.status(400).json({ message: "Create ticket error!" })
        }
    }

    //Обновить тикет
    async updateTicket(req, res) {

    }

    //Зыкрыть тикет
    async closeTicket(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Ticket ID is empty!" })
            }
            const updated_rows = await Tickets.update({ status: 'close' }, {
                where: {
                    id: id
                }
            })

            return res.status(200).json(updated_rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Close ticket error!" })
        }
    }

    //Удалить тикет
    async deleteTicket(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: "Ticket ID is empty!" })
            }
            const deleted_rows = await Tickets.destroy({
                where: {
                    id: id
                }
            })
            return res.status(200).json(deleted_rows)

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Delete ticket error!" })
        }
    }


    //Установить ответственного
    async setResp(req, res) {
        try {
            const { ticket_id, user_id } = req.body
            const username = await User.findByPk(user_id)
            await Tickets.update({responsible_id: user_id, responsible_name: username.login, status: 'active' }, {where: {id:ticket_id}})

        } catch (e) {
            console.log(e)
            return res.status(400).json({ message: "Update ticket error!" })
        }
    }

}

module.exports = new ticketController()

