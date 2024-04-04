
const db = require('../utils/db.utils')
const bcrypt = require('bcrypt')
const saltRounds = 5;
const {validationResult} = require('express-validator')
const jwt = require('jsonwebtoken')
const congif = require('../config/app.config')


const User = require('../models/user.model')

const generateAccessToken = (id, login, role) => {
    const payload = {
        id, role , login
    }
    return jwt.sign(payload,congif.secret)

}

class authController {
    async registration(req, res) {

        try {
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                return res.status(400).json({message: `Ошибка при заполнении формы регистрации! `, errors})
            }

            const {login, email, password } = req.body

            const candidate = await User.findAll({where:{email: email}, raw: true })
            if(candidate.length != 0){
                return res.status(400).json({message: 'Пользователь с таким Email уже существует!'})
            }

            //TODO: Добавить статус и дату окончания подписки!

            const hashPW = bcrypt.hashSync(password, saltRounds);

            const user = await User.create({
                login: login,
                email: email,
                password: hashPW,
            })
            
            res.status(200).json({message: 'Пользователь успешно создан!', user})

            
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Registration error!'})
        }


    }

    async login(req, res) {
        try {
            const {email, password } = req.body
            // console.log(email, password);
         
            const candidate = await User.findAll({where:{email: email}, raw: true })

            if(candidate.length == 0){
                return res.status(200).json({error: 'Пользователя с таким Email не существует!', logstatus: false})
            }

            const validPW = bcrypt.compareSync(password, candidate[0].password)

            if(!validPW){
                return res.status(200).json({error: 'Неверный пароль!', logstatus: false})
            }

            const token = generateAccessToken(candidate[0].id, candidate[0].email)     
            
           
            res.status(200).json({token, logstatus: true})

        } catch (e) {
            console.log(e)
            res.status(200).json({error: 'Login error!', logstatus: false})

        }
    }

    async getUsers(req, res) {
        try {
            const rows = await User.findAll({raw: true })            
            // console.log(rows);
            res.status(200).json(rows)
        } catch (e) {
            console.log(e)
        }
    }

    async fetchinfo(req, res) {
        try {
            const token = req.body.token
            if(token) {
                const decodedJWT = jwt.verify(token, congif.secret); 
                const user_id = decodedJWT.id
                const userData  = await User.findByPk(user_id)
                if(userData.dataValues) {
                    res.status(200).json({
                        id: userData.dataValues.id,
                        login: userData.dataValues.login,
                        email: userData.dataValues.email
                    })
                }else {
                    res.status(200).json({error: 'User not found'})
                }
            }
            else{
                res.status(200).json({error: 'Empty Token'})
            }
        } catch (error) {
            console.log(error)
            res.status(404)
        }
    }

}

module.exports = new authController()