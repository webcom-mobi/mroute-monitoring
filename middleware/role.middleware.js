const jwt = require('jsonwebtoken')
const {secret}  = require('../config/app.config')

module.exports = function(roles) {
    return function(req, res, next){
        if(req.method === 'OPTIONS') {
            next()
        }
    
        try{
    
            const token = req.headers.authorization.split(' ')[1]
            if(!token){
                return res.status(403).json({message: 'Пользователь не авторизован'})
            }
    
            const {role} = jwt.verify(token, secret)
            

            if(role != 'admin') {
               return res.status(403).json({message: 'Доступ запрещен'})
            }
            next()
    
    
        }catch(e){
            console.log(e)
            return res.status(403).json({message: 'Пользователь не авторизован'})
        }
    }
}