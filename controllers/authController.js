const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Users, Salons } = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');
const { config } = require('../config/appConfig');





const getSignUpForm = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','userSignUp.html'));
}

const postUserDetails = asyncHandler(async (req,res) => {
    
    const t = await sequelize.transaction();

    try{
        
        const {name,email,password,role} = req.body;
        const encryptedPassword = await bcrypt.hash(password,10);

        let user = await Users.findOne({
            where: {
                email: email
            }
        })

        if (role != 'Admin' && role != 'Customer') {
            await t.rollback();
            return res.status(400).json({message: 'Invalid role'});
        }

        if(!user){
           
            await Users.create({
                name: name,
                email: email,
                password: encryptedPassword,
                role: role
            },{transaction:t});
            
            await t.commit();
            res.status(200).json({message:"user created successfully"});
        }
        
        else{
           await t.rollback();
           res.status(409).json({message:"user with this email alredy exists"});

        }
        
    }catch(error){
        
        await t.rollback();
        throw error;
    }
   
});

const getLoginForm = (req,res) =>{

    res.sendFile(path.join(__dirname,'../','views','userLogin.html'));
}

function generateAccessToken(id){

    return jwt.sign({userId:id}, config.auth.jwtSecret);

}

const validateUser = asyncHandler(async (req,res) => {
    
    const {email,password} = req.body;

    const user = await Users.findOne({

        where: {
            email: email
        }
    });

    if(!user){
        return res.status(404).json({message:"user with email does not exixt"});
    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(401).json({message:"incorrect password"});
    }
    
    const token = generateAccessToken(user.id);

    const isProfileComplete = user.profile_completed;
    const fullName = user.name;
    const role = user.role;

    let hasSalon = false;

    if (user.role === 'Admin') {
        const salon = await Salons.findOne({
            where: {
                adminId: user.id
            }
        });

        if (salon) {
            hasSalon = true;
        }
    }

    res.cookie('token', token, { 
        httpOnly: true,          
            secure: config.auth.cookieSecure,    
        // path : '/',        
        maxAge: 24 * 60 * 60 * 1000, 
        sameSite: 'lax'      
    });

    res.status(200).json({message:"user logged in",token,isProfileComplete,fullName,role,hasSalon});

});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token');

  res.status(200).json({
    message: 'Logged out successfully'
  });
});


module.exports = {
    getSignUpForm,
    getLoginForm,
    postUserDetails,
    getLoginForm,
    validateUser,
    logout
}
