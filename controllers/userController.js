const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Appointments,Staff,Reviews} = require('../models');
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

        if (user.role != 'admin' && user.role != 'customer') {
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

const getUserProfileForm = (req,res) => {

    res.sendFile(path.join(__dirname,'../','views','userProfile.html'));
}

const postUserProfileDetails = async (req,res) => {
       
    const t = await sequelize.transaction();

    try{
       
        const {phone,notification_preference,notes} = req.body;
        const user = req.user;
        user.phone = phone;
        user.notification_preference = notification_preference;
        user.notes = notes;
        user.profile_completed = true;
        await user.save({transaction:t});
        await t.commit();
        res.status(200).json({message:"user profile details updated"});

    }catch(error){
        
        await t.rollback();
        console.log("ERROR DURING FILING PROFILE DETAILS ---> ",error);
    }
}

const getCustomerDashboard = async (req,res) => {
      
    res.sendFile(path.join(__dirname,'../','views','customerDashboard.html'));
}

const getDashboardData = async (req, res) => {
    try {
        const salons = await Salons.findAll();

        res.status(200).json({
            salons: salons
        });

    } catch (error) {
        console.log("ERROR GETTING SALONS ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};


const getSalonServicesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'salonServices.html'));
};

const getSalonServices = async (req, res) => {
    try {
        const salonId = req.params.salonId;

        const salon = await Salons.findByPk(salonId, {
            include: [
                {
                    model: Services,
                    as: 'services',
                    where: {
                        is_active: true
                    },
                    required: false
                }
            ]
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        res.status(200).json({
            salon: salon,
            services: salon.services
        });

    } catch (error) {
        console.log("ERROR GETTING SALON SERVICES ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const getMyAppointments = async (req, res) => {
    try {
        const appointments = await Appointments.findAll({
            where: {
                userId: req.user.id,
                status: {
                    [Op.in]: ['booked', 'completed', 'cancelled']
                },
                paymentStatus: 'paid'
            },
            include: [
                { model: Salons, as: 'salon' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' },
                {model: Reviews, as: 'review', required: false}
            ],
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        res.status(200).json({
            appointments
        });

    } catch (error) {
        console.log("ERROR GETTING USER APPOINTMENTS ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const cancelAppointment = async (req, res) => {

    const t = await sequelize.transaction();

    try {
        const appointmentId = req.params.id;

        const appointment = await Appointments.findOne({
            where: {
                id: appointmentId,
                userId: req.user.id
            }
        });

        if (!appointment) {
            return res.status(404).json({
                message: "appointment not found"
            });
        }

        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                message: "appointment already cancelled"
            });
        }

        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.appointment_time}`
        );

        if (appointmentDateTime <= new Date()) {
            return res.status(400).json({
                message: "past appointments cannot be cancelled"
            });
        }

        appointment.status = 'cancelled';
        appointment.reminder_sent = true;

        await appointment.save({transaction: t});
        t.commit();

        res.status(200).json({
            message: "appointment cancelled successfully"
        });

    } catch (error) {
        console.log("ERROR CANCELLING APPOINTMENT ---> ", error);
        t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const getReviewForm = async (req,res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'review.html'));
}

const postReview = async (req, res) => {
  
    const t = await sequelize.transaction();

    try {
        
        const {appointmentId,rating,comment} = req.body;

        if (!appointmentId || !rating || !comment) {
            return res.status(400).json({message: 'Appointment, rating and comment are required'});
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({message: 'Rating must be between 1 and 5'});
        }

        const appointment = await Appointments.findOne({
            where: {
                id: appointmentId,
                userId: req.user.id,
                status: 'completed',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            return res.status(404).json({message: 'Only completed paid appointments can be reviewed'});
        }

        const existingReview = await Reviews.findOne({
            where: {
                appointmentId
            }
        });

        if (existingReview) {
            return res.status(409).json({message: 'You have already reviewed this appointment'});
        }

        const review = await Reviews.create({
            appointmentId,
            userId: req.user.id,
            rating,
            comment
        },{transaction : t});

        await t.commit();

        res.status(201).json({message: 'Review submitted successfully',review});

    } catch (error) {
        console.log('ERROR CREATING REVIEW --->', error);
        await t.rollback();
        res.status(500).json({message: 'Could not submit review'});
    }
};

const logout = (req, res) => {
  res.clearCookie('token');

  res.status(200).json({
    message: 'Logged out successfully'
  });
};

module.exports = {
    getSignUpForm,
    postUserDetails,
    getLoginForm,
    validateUser,
    getUserProfileForm,
    postUserProfileDetails,
    getCustomerDashboard,
    getDashboardData,
    getSalonServices,
    getSalonServicesPage,
    getMyAppointments,
    cancelAppointment,
    postReview,getReviewForm,
    logout
}