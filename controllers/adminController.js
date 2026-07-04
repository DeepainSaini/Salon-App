const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Staff,Appointments} = require('../models');
const {Sequelize,DataTypes, where} = require('sequelize');
const { sequelize } = require('../models');

const getAdminDetailsForm = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','salonDetails.html'));
}

const getAdminDashboard = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','adminDashboard.html'));
}

const getAdminDashboardData = async (req,res) => {
    try {
        const salon = await Salons.findOne({
                            where: {
                                adminId: req.user.id
                            },
                            include: [
                                {
                                    model: Services,
                                    as: 'services'
                                },
                                {
                                    model: Staff,
                                    as: 'staff',
                                    include: [
                                        {
                                            model: Services,
                                            as: 'service'
                                        }
                                    ]
                                }
                            ]
                       });

        if(!salon){
            return res.status(404).json({message:"salon details not found"});
        }

        const appointments = await Appointments.findAll({
            where: {
                salonId: salon.id
            },
            include: [
                { model: Users, as: 'customer' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' }
            ],
            order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
        });

        console.log("SERVICE ------->>>>>>>",salon.services);

        return res.status(200).json({
            salon: salon,
            services: salon.services || [],
            staff: salon.staff,
            appointments
        });

    } catch (error) {
        console.error("ERROR WHILE LOADING ADMIN DASHBOARD DATA ---> ",error);
        return res.status(500).json({message:"something went wrong"});
    }
}

const postSalonDetails = async (req,res) => {
    
    const t = await sequelize.transaction();
    console.log("SALON DETAILS ------> ",req.body);

    try {
        
        const {name,description,email,address,zipcode,city,phone,open_time,close_time} = req.body;

        const newSalon = await Salons.create({
            name: name,
            description: description,
            email: email,
            address: address,
            zip_code: zipcode,
            city: city,
            phone: phone,
            open_time: open_time,
            close_time: close_time,
            adminId: req.user.id 
        }, { transaction: t });

         await t.commit();

        return res.status(201).json({
            success: true,
            message: "Onboarding complete! Your salon profile and menu are active."
        });

    } catch (error) {
        await t.rollback();
        console.error("CRITICAL ONBOARDING ERROR in admincontroller:", error);
        return res.status(500).json({ message: "Internal server error during Posting salon details." });
    }
    
}

const getAddServiceForm =  (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','addServices.html'));
}

const postAddedService = async (req,res) => {

    const t = await sequelize.transaction();
    console.log("SERVICE TO ADD -------> ",req.body);

    try{

        const {name,description,price,duration} = req.body;

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "Please create salon details first"
            });
        }

        const newService = await Services.create({
            name: name,
            description: description,
            price: price,
            duration: duration,
            salonId: salon.id 
        }, { transaction: t });

        await t.commit();

        res.status(201).json({
            message: "Service added successfully"
        });

    }catch(error){

        console.log("ERROR ADDING SERVICE ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
}

const changeServiceStatus = async (req,res) => {

    const t = await sequelize.transaction();
    
    try{

        const serviceId = req.params.id;
         const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const service = await Services.findOne({
            where: {
                id: serviceId,
                salonId: salon.id   // always add salonId so that other admin can't change other service 
            }
        });

        if (!service) {
            return res.status(404).json({
                message: "service not found"
            });
        }

        service.is_active = !service.is_active;

        await service.save();

        res.status(200).json({
            message: "service status updated",
            is_active: service.is_active
        });

    } catch (error) {
        console.log("ERROR UPDATING SERVICE STATUS ---> ", error);

        res.status(500).json({
            message: "something went wrong"
        });
    }
    
};

const getAddStaffForm =  (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','addStaff.html'));
}

const getDataForStaffForm = async (req, res) => {
    
    try {
        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const services = await Services.findAll({
            where: {
                salonId: salon.id,
                is_active: true
            }
        });

        res.status(200).json({
            salon: {
                open_time: salon.open_time,
                close_time: salon.close_time
            },
            services: services
        });

    } catch (error) {
        console.log("ERROR GETTING SERVICES FOR STAFF FORM ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const postAddStaff = async (req, res) => {
    try {
        const {name,phone,email,specialization,available_from,available_to,serviceId} = req.body;

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const service = await Services.findOne({
            where: {
                id: serviceId,
                salonId: salon.id,
                is_active: true
            }
        });

        if (!service) {
            return res.status(404).json({
                message: "service not found for your salon"
            });
        }

        const salonOpen = salon.open_time.slice(0, 5);
        const salonClose = salon.close_time.slice(0, 5);

        if (available_from >= available_to) {
            return res.status(400).json({
                message: "Available from must be before available to"
            });
        }

        if (available_from < salonOpen || available_to > salonClose) {
            return res.status(400).json({
                message: "Staff availability must be inside salon working hours"
            });
        }

        await Staff.create({
            name: name,
            phone: phone,
            email: email,
            specialization: specialization,
            available_from: available_from,
            available_to: available_to,
            salonId: salon.id,
            serviceId: service.id
        });

        res.status(201).json({
            message: "staff added successfully"
        });

    } catch (error) {
        console.log("ERROR ADDING STAFF ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

module.exports = {
    getAdminDetailsForm,
    getAdminDashboard,
    getAdminDashboardData,
    postSalonDetails,
    postAddedService,
    getAddServiceForm,
    changeServiceStatus,
    getAddStaffForm,
    getDataForStaffForm,
    postAddStaff
}
