const jwt = require('jsonwebtoken');
const {Users} = require('../models');
require('dotenv').config();


const authenticate = async (req,res,next) => {
     
    try{

        const token = req.cookies.token || req.header('Authorization');
        
        if(!token){
            return res.redirect('/user/login');
        }
        
        console.log("TOKEN --->  ",token);
        const jwtSignedObj = jwt.verify(token,process.env.JWT_SECRET_KEY);
        const userId = jwtSignedObj.userId;
        console.log("USER WITH THIS ID SENT REQUEST --> ",userId);
        const user = await Users.findByPk(userId);
        req.user = user;
        next();

    }catch(error){
        console.log("ERROR DURING AUTHENTICATION --> ",error);
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }
}

module.exports = {
    authenticate
}

