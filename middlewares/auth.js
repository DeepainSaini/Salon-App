const jwt = require('jsonwebtoken');
const {Users} = require('../models');
const { config } = require('../config/appConfig');


const authenticate = async (req,res,next) => {
     
    try{

        const token = req.cookies.token || req.header('Authorization');
        
        if(!token){
            return res.redirect('/user/login');
        }
        
        const jwtSignedObj = jwt.verify(token, config.auth.jwtSecret);
        const userId = jwtSignedObj.userId;
        const user = await Users.findByPk(userId);

        if (!user) {
        res.clearCookie('token');
        return res.redirect('/user/login');
        }
        req.user = user;
        next();

    }catch(error){
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}

module.exports = {
    authenticate
}

