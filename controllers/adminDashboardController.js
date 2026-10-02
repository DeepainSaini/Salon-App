const path = require('path');
const {Users,Salons,Services,Staff,Appointments,Reviews,Invoice} = require('../models');
const {Op} = require('sequelize');
const asyncHandler = require('../util/asyncHandler');

const getAdminDashboard = async (req,res) => {
    res.sendFile(path.join(__dirname,'../','views','adminDashboard.html'));
}

const getAdminDashboardData = asyncHandler(async (req,res) => {
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
                                        as: 'services'
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
            { model: Reviews, as: 'review', required: false},
            { model: Invoice, as: 'invoice', required: false }
        ],
        order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
    });

    return res.status(200).json({
        salon: salon,
        services: salon.services || [],
        staff: salon.staff,
        appointments
    });
});

module.exports = {
    getAdminDashboard,
    getAdminDashboardData

}
