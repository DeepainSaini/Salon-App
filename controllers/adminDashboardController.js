const path = require('path');
const {Users,Salons,Services,Staff,Appointments,Reviews,Invoice} = require('../models');
const {Op} = require('sequelize');
const asyncHandler = require('../util/asyncHandler');
const { getPagination, getPaginationMeta } = require('../util/pagination');

const getAdminDashboard = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','adminDashboard.html'));
}

const getAdminDashboardData = asyncHandler(async (req,res) => {

    const servicePagination = getPagination(req.query, {
        pageKey: 'servicePage',
        limitKey: 'serviceLimit'
    });

    const staffPagination = getPagination(req.query, {
        pageKey: 'staffPage',
        limitKey: 'staffLimit'
    });

    const appointmentPagination = getPagination(req.query, {
        pageKey: 'appointmentPage',
        limitKey: 'appointmentLimit'
    });

    const salon = await Salons.findOne({
        where: {
            adminId: req.user.id
        }
                   });

    if(!salon){
        return res.status(404).json({message:"salon details not found"});
    }

    const { count: serviceCount, rows: services } = await Services.findAndCountAll({
        where: {
            salonId: salon.id
        },
        order: [['name', 'ASC']],
        limit: servicePagination.limit,
        offset: servicePagination.offset,
        distinct: true
    });

    const { count: staffCount, rows: staff } = await Staff.findAndCountAll({
        where: {
            salonId: salon.id
        },
        include: [
            {
                model: Services,
                as: 'services'
            }
        ],
        order: [['name', 'ASC']],
        limit: staffPagination.limit,
        offset: staffPagination.offset,
        distinct: true
    });

    const { count, rows: appointments } = await Appointments.findAndCountAll({
        where: {
            salonId: salon.id,
            status: {
            [Op.in]: ['booked', 'completed', 'cancelled']
            },
            paymentStatus: 'paid'
        },
        include: [
            { model: Users, as: 'customer' },
            { model: Services, as: 'service' },
            { model: Staff, as: 'staff' },
            { model: Reviews, as: 'review', required: false },
            { model: Invoice, as: 'invoice', required: false }
        ],
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']],
        limit: appointmentPagination.limit,
        offset: appointmentPagination.offset,
        distinct: true
    });

    return res.status(200).json({
        salon,
        services,
        staff,
        appointments,
        servicePagination: getPaginationMeta(serviceCount, servicePagination.page, servicePagination.limit),
        staffPagination: getPaginationMeta(staffCount, staffPagination.page, staffPagination.limit),
        appointmentPagination: getPaginationMeta(count, appointmentPagination.page, appointmentPagination.limit),
        pagination: getPaginationMeta(count, appointmentPagination.page, appointmentPagination.limit)
    });
});

module.exports = {
    getAdminDashboard,
    getAdminDashboardData

}
