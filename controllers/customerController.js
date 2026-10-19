const path = require('path');
const { Salons, Services, Appointments, Staff, Reviews, Invoice } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');
const { getPagination, getPaginationMeta } = require('../util/pagination');
const { deleteBookedSlotByAppointmentId } = require('../util/services/bookedSlotService');
const { getCache, setCache } = require('../util/services/cacheServices');
const logger = require('../util/logger');



const getCustomerDashboard = async (req,res) => {
      
    res.sendFile(path.join(__dirname,'../','views','customerDashboard.html'));
}

const getDashboardData = asyncHandler(async (req, res) => {
    
    const { page, limit, offset } = getPagination(req.query);
    const { search } = req.query;

    const searchText = search || 'all';
    const cacheKey = `salons:search:${searchText}:page:${page}:limit:${limit}`;
    const startTime = Date.now();
    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        logger.info('CACHE HIT', {
            key: cacheKey,
            durationMs: Date.now() - startTime
        });
        return res.status(200).json(cachedData);
    }

    const whereCondition = {};

    if (search) {
        whereCondition.name = {
            [Op.like]: `${search}%`
        };
    }

    const { count, rows: salons } = await Salons.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        order: [['name', 'ASC']]
    });

    const responseData = {
        salons,
        pagination: getPaginationMeta(count, page, limit)
    };

    await setCache(cacheKey, responseData, 300);
    logger.info('CACHE MISS', {
        key: cacheKey,
        durationMs: Date.now() - startTime
    });

    res.status(200).json(responseData);

});


const getSalonServicesPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'salonServices.html'));
};

const getSalonServices = asyncHandler(async (req, res) => {

    const salonId = req.params.salonId;
    const { page, limit, offset } = getPagination(req.query);
    const cacheKey = `salon:${salonId}:services:page:${page}:limit:${limit}`;
    const startTime = Date.now();

    const cachedData = await getCache(cacheKey);

    if (cachedData) {
        logger.info('CACHE HIT', {
            key: cacheKey,
            durationMs: Date.now() - startTime
        });
        return res.status(200).json(cachedData);
    }

    const salon = await Salons.findByPk(salonId);

    if (!salon) {
        return res.status(404).json({
            message: "salon not found"
        });
    }

    const { count, rows: services } = await Services.findAndCountAll({
        where: {
            salonId,
            is_active: true
        },
        order: [['name', 'ASC']],
        limit,
        offset,
        distinct: true
    });

    const responseData = {
        salon: salon,
        services,
        pagination: getPaginationMeta(count, page, limit)
    };

    await setCache(cacheKey, responseData, 300);
    logger.info('CACHE MISS', {
        key: cacheKey,
        durationMs: Date.now() - startTime
    });

    res.status(200).json(responseData);

});

const getMyAppointments = asyncHandler(async (req, res) => {
    
    const { page, limit, offset } = getPagination(req.query);
    const { count, rows: appointments } = await Appointments.findAndCountAll({
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
            { model: Reviews, as: 'review', required: false },
            { model: Invoice, as: 'invoice', required: false }
        ],
        order: [['appointment_date', 'DESC'], ['appointment_time', 'DESC']],
        limit,
        offset,
        distinct: true
    });

    res.status(200).json({
        appointments,
        pagination: getPaginationMeta(count, page, limit)
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
        await deleteBookedSlotByAppointmentId(appointment.id, t);
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
