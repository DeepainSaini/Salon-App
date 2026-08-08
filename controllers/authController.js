const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,PasswordReq} = require('../models');
const {Sequelize,DataTypes, where,Op} = require('sequelize');
const { sequelize } = require('../models');





const getSignUpForm = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','userSignUp.html'));
}

const postUserDetails = async (req,res) => {
    
    const t = await sequelize.transaction();

    try{
        
        const {name,email,password,role} = req.body;
        console.log("request body>>>>>>>>>",req.body);
        const encryptedPassword = await bcrypt.hash(password,10);

        let user = await Users.findOne({
            where: {
                email: email
            }
        })

        console.log(user);

        if (role != 'Admin' && role != 'Customer') {
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
        
        console.log("ERROR IN USERCONTROLLER --->  ",error);
        await t.rollback();
        res.status(500).json({message:"something went wrong"});
    }
   
}

const getLoginForm = (req,res) =>{

    res.sendFile(path.join(__dirname,'../','views','userLogin.html'));
}

function generateAccessToken(id){

    return jwt.sign({userId:id},process.env.JWT_SECRET_KEY);

}

const validateUser = async (req,res) => {
    

    try{
        
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
            secure: false,    
            // path : '/',        
            maxAge: 24 * 60 * 60 * 1000, 
            sameSite: 'lax'      
        });

        res.status(200).json({message:"user logged in",token,isProfileComplete,fullName,role,hasSalon});

    }catch(error){

        console.log("Login Error --> ",error);
        res.status(500).json({message:"something went wrong"});
    }
   
}

const logout = (req, res) => {
  res.clearCookie('token');

  res.status(200).json({
    message: 'Logged out successfully'
  });
};


module.exports = {
    getSignUpForm,
    getLoginForm,
    postUserDetails,
    getLoginForm,
    validateUser,
    logout
}