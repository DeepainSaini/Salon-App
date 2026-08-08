const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Appointments,Staff,Reviews,Invoice} = require('../models');
const {Sequelize,DataTypes, where,Op} = require('sequelize');
const { sequelize } = require('../models');



const getCustomerDashboard = async (req,res) => {
      
    res.sendFile(path.join(__dirname,'../','views','customerDashboard.html'));
}

const getDashboardData = async (req, res) => {
    try {

        const { search } = req.query;

        const whereCondition = {};

        if (search) {
            whereCondition.name = {
                [Op.like]: `${search}%`
            };
        }

        const salons = await Salons.findAll({
            where: whereCondition
        });

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
                {model: Reviews, as: 'review', required: false},
                { model: Invoice, as: 'invoice', required: false }
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
        await t.commit();

        res.status(200).json({
            message: "appointment cancelled successfully"
        });

    } catch (error) {
        console.log("ERROR CANCELLING APPOINTMENT ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
};





module.exports = {

    getCustomerDashboard,
    getDashboardData,
    getSalonServices,
    getSalonServicesPage,
    getMyAppointments,
    cancelAppointment,
    
}