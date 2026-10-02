const path = require('path');
const { Services, Staff, Appointments } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { createOrder } = require('../util/services/cashfreeServices');
const { getAvailableSlotsForService } = require('../util/services/availabilityService');
const asyncHandler = require('../util/asyncHandler');


const getBookAppointmentPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'bookAppointment.html'));
};


const getAvailableSlots = asyncHandler(async (req, res) => {

    
    const { salonId, serviceId, date, excludeAppointmentId } = req.query;

    if (!salonId || !serviceId || !date) {
        return res.status(400).json({
            message: "salonId, serviceId and date are required"
        });
    }

    const result = await getAvailableSlotsForService({
        salonId,
        serviceId,
        date,
        excludeAppointmentId
    });

    if (result.error) {
        return res.status(result.error.status).json({
            message: result.error.message
        });
    }
    
    res.status(200).json({
        slots: result.slots
    });

});

const postBookAppointment = asyncHandler(async (req, res) => {
    
    const t = await sequelize.transaction();

    try {
        const { salonId, serviceId,staffId,appointment_date,appointment_time} = req.body;

        const userId = req.user.id;

        const service = await Services.findOne({
            where: {
                id: serviceId,
                salonId: salonId,
                is_active: true
            }
        });

        if (!service) {
            await t.rollback();
            return res.status(404).json({
                message: "service not found"
            });
        }

        const staff = await Staff.findOne({
            where: {
                id: staffId,
                salonId: salonId,
                is_active: true
            },
            include: [
                {
                model: Services,
                as: 'services',
                where: {
                    id: serviceId
                }
                }
            ]
        });

        if (!staff) {
            await t.rollback();
            return res.status(404).json({
                message: "staff not found for this service"
            });
        }

        const selectedTime = appointment_time.slice(0, 5);
        const staffStart = staff.available_from.slice(0, 5);
        const staffEnd = staff.available_to.slice(0, 5);

        if (selectedTime < staffStart || selectedTime >= staffEnd) {
            await t.rollback();
            return res.status(400).json({
                message: "selected time is outside staff availability"
            });
        }

        const existingAppointment = await Appointments.findOne({
            where: {
                staffId: staffId,
                appointment_date: appointment_date,
                appointment_time: selectedTime,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if (existingAppointment) {
            await t.rollback();
            return res.status(409).json({
                message: "This slot is already booked"
            });
        }

        const orderId = "ORDER-" + Date.now();           //Initiating payment by creating cashfree order. 
        const paymentSessionId = await createOrder(      //date.now() returns the current timestamp—the exact number 
            orderId,                                     //of milliseconds that have passed since January 1, 1970
            Number(service.price),
            req.user.id,
            req.user.phone || "9999999999"
        );

        const appointment = await Appointments.create({
            userId: userId,
            salonId: salonId,
            serviceId: serviceId,
            staffId: staffId,
            appointment_date: appointment_date,
            appointment_time: selectedTime,
            status: 'pending_payment',
            paymentStatus: 'pending',
            bookingPrice: service.price,
            orderId,
            paymentSessionId

        },{transaction: t});

        await t.commit();

        res.status(201).json({message: "appointment booked successfully",appointment: appointment,orderId,paymentSessionId});

    } catch (error) {
        await t.rollback();
        throw error;
    }
});

const rescheduleAppointment = asyncHandler(async (req,res) => {

    const t = await sequelize.transaction();

    try{

        const {staffId,appointment_date,appointment_time,appointmentId} = req.body;

        const appointment = await Appointments.findOne({

            where: {
                id: appointmentId,
                userId: req.user.id,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if(!appointment){
            await t.rollback();
            return res.status(404).json({message:"paid appointment not found"});
        }

        const conflict = await Appointments.findOne({

            where: {
                staffId: staffId,
                appointment_date: appointment_date,
                appointment_time: appointment_time,
                status: 'booked',
                id: {
                    [Op.ne]: appointmentId
                }
            }
        });

        if(conflict){
            await t.rollback();
            return res.status(400).json({message:"the slot is already booked"});
        }
        
        appointment.staffId = staffId;
        appointment.appointment_date = appointment_date;
        appointment.appointment_time = appointment_time;

        await appointment.save({transaction : t});
        await t.commit();

        res.status(201).json({
        message: 'Appointment rescheduled successfully',
        appointment
        });
        
    }catch(error){
        
        await t.rollback();
        throw error;
    }
});




module.exports = {
    getBookAppointmentPage,
    getAvailableSlots,
    postBookAppointment,
    rescheduleAppointment
}
