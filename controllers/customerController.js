const path = require('path');
const { Salons, Services, Appointments, Staff, Reviews, Invoice } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');



const getCustomerDashboard = async (req,res) => {
      
    res.sendFile(path.join(__dirname,'../','views','customerDashboard.html'));
}

const getDashboardData = asyncHandler(async (req, res) => {

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

});


const getSalonServicesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'salonServices.html'));
};

const getSalonServices = asyncHandler(async (req, res) => {

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

});

const getMyAppointments = asyncHandler(async (req, res) => {

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

});

const cancelAppointment = asyncHandler(async (req, res) => {

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
            await t.rollback();
            return res.status(404).json({
                message: "appointment not found"
            });
        }

        if (appointment.status === 'cancelled') {
            await t.rollback();
            return res.status(400).json({
                message: "appointment already cancelled"
            });
        }

        const appointmentDateTime = new Date(
            `${appointment.appointment_date}T${appointment.appointment_time}`
        );

        if (appointmentDateTime <= new Date()) {
            await t.rollback();
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
        await t.rollback();
        throw error;
    }
});





module.exports = {

    getCustomerDashboard,
    getDashboardData,
    getSalonServices,
    getSalonServicesPage,
    getMyAppointments,
    cancelAppointment,
    
}
