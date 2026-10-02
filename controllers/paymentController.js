const path = require('path');
const {Salons,Services,Staff,Appointments} = require('../models');
const { sequelize } = require('../models');
const { sendBookingConfirmationEmail } = require('../util/services/emailServices');
const { getPaymentStatus } = require('../util/services/cashfreeServices');
const asyncHandler = require('../util/asyncHandler');

const paymentStatus = asyncHandler(async (req, res) => {
    
    const t = await sequelize.transaction();
    
    try {
        const { orderId } = req.params;

        const status = await getPaymentStatus(orderId);

        const appointment = await Appointments.findOne({
            where: {
                orderId,
                userId: req.user.id
            },
            include: [
                { model: Salons, as: 'salon' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' }
            ]
        });

        if (!appointment) {
            await t.rollback();
            return res.status(404).json({
                message: "appointment not found"
            });
        }

        appointment.paymentStatus = status;

        if (status === 'paid') {
            await sendBookingConfirmationEmail(req.user.email, {
                salonName: appointment.salon.name,
                serviceName: appointment.service.name,
                staffName: appointment.staff.name,
                date: appointment.appointment_date,
                time: appointment.appointment_time
            });
            
            appointment.status = 'booked';
            appointment.paymentStatus = 'paid';

        }else if (status === 'failed') {
            appointment.status = 'payment_failed';
            appointment.paymentStatus = 'failed';
        }else{
            appointment.paymentStatus = 'pending';
        }

        await appointment.save({transaction : t});
        await t.commit();

        res.redirect('/user/dashboard');

    } catch (error) {
        await t.rollback();
        throw error;
    }
});

module.exports = {
    paymentStatus
}
