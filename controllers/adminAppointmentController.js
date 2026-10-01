const path = require('path');
const {Op} = require('sequelize');
const {Users,Salons,Services,Staff,Appointments,Invoice} = require('../models');
const { sequelize } = require('../models');
const { generateInvoicePdf } = require('../util/services/invoiceService');
const { getAvailableSlotsForService } = require('../util/services/availabilityService');
const asyncHandler = require('../util/asyncHandler');

const markAppointmentCompleted = asyncHandler(async (req, res) => {

    const t = await sequelize.transaction();

    try {

        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({message: 'Salon not found'});
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            },
            include: [
                { model: Users, as: 'customer' },
                { model: Services, as: 'service' },
                { model: Staff, as: 'staff' }
            ]
        });

        if (!appointment) {
            await t.rollback();
            return res.status(404).json({message: 'Paid booked appointment not found'});
        }

        appointment.status = 'completed';

        await appointment.save({transaction: t});

        const existingInvoice = await Invoice.findOne({
            where: {
                appointmentId: appointment.id
            }
        });

        if (!existingInvoice) {
            const invoiceNumber = `INV-${appointment.id}-${Date.now()}`;

            const pdfPath = await generateInvoicePdf({
                invoiceNumber,
                invoiceDate: new Date().toLocaleDateString(),
                salonName: salon.name,
                customerName: appointment.customer.name,
                serviceName: appointment.service.name,
                staffName: appointment.staff.name,
                appointmentDate: appointment.appointment_date,
                appointmentTime: appointment.appointment_time,
                paymentStatus: appointment.paymentStatus,
                amount: appointment.bookingPrice
            });

            await Invoice.create({
                appointmentId: appointment.id,
                invoiceNumber,
                amount: appointment.bookingPrice,
                pdfPath
            }, { transaction: t });
        }
        await t.commit();

        res.status(200).json({message: 'Appointment marked as completed and invoice generated',appointment});

    } catch (error) {
        console.log('ERROR MARKING APPOINTMENT COMPLETED --->',error);
        await t.rollback();
        throw error;
    }
});

const cancelAppointmentByAdmin = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const salon = await Salons.findOne({
            where: {
                adminId: req.user.id
            }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({
                message: "salon not found"
            });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            await t.rollback();
            return res.status(404).json({
                message: "booked paid appointment not found"
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

        await appointment.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: "appointment cancelled successfully"
        });

    } catch (error) {
        console.log("ADMIN CANCEL APPOINTMENT ERROR --->", error);
        await t.rollback();
        throw error;
    }
});

const getEditAppointmentPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'editAppointment.html'));
};

const getAppointmentDataForAdmin = asyncHandler(async (req, res) => {
    const salon = await Salons.findOne({
        where: { adminId: req.user.id }
    });

    if (!salon) {
        return res.status(404).json({ message: "salon not found" });
    }

    const appointment = await Appointments.findOne({
        where: {
            id: req.params.id,
            salonId: salon.id
        },
        include: [
            { model: Users, as: 'customer' },
            { model: Services, as: 'service' },
            { model: Staff, as: 'staff' }
        ]
    });

    if (!appointment) {
        return res.status(404).json({ message: "appointment not found" });
    }

    res.status(200).json({ appointment });
});

const getAvailableSlotsForAdmin = asyncHandler(async (req, res) => {
    
    const { date } = req.query;

    if (!date) {
        return res.status(400).json({ message: "date is required" });
    }

    const salon = await Salons.findOne({
        where: { adminId: req.user.id }
    });

    if (!salon) {
        return res.status(404).json({ message: "salon not found" });
    }

    const appointment = await Appointments.findOne({
        where: {
            id: req.params.id,
            salonId: salon.id,
            status: 'booked',
            paymentStatus: 'paid'
        }
    });

    if (!appointment) {
        return res.status(404).json({ message: "booked paid appointment not found" });
    }

    const result = await getAvailableSlotsForService({
        salonId: salon.id,
        serviceId: appointment.serviceId,
        date,
        excludeAppointmentId: appointment.id
    });

    if (result.error) {
        return res.status(result.error.status).json({
            message: result.error.message
        });
    }

    res.status(200).json({ slots: result.slots });
});

const rescheduleAppointmentByAdmin = asyncHandler(async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const { staffId, appointment_date, appointment_time } = req.body;

        const salon = await Salons.findOne({
            where: { adminId: req.user.id }
        });

        if (!salon) {
            await t.rollback();
            return res.status(404).json({ message: "salon not found" });
        }

        const appointment = await Appointments.findOne({
            where: {
                id: req.params.id,
                salonId: salon.id,
                status: 'booked',
                paymentStatus: 'paid'
            }
        });

        if (!appointment) {
            await t.rollback();
            return res.status(404).json({ message: "booked paid appointment not found" });
        }

        const staff = await Staff.findOne({
            where: {
                id: staffId,
                salonId: salon.id,
                is_active: true
            },
            include: [
                {
                    model: Services,
                    as: 'services',
                    where: {
                        id: appointment.serviceId
                    }
                }
            ]
        });

        if (!staff) {
            await t.rollback();
            return res.status(404).json({ message: "staff not available for this service" });
        }

        const selectedTime = appointment_time.slice(0, 5);

        const conflict = await Appointments.findOne({
            where: {
                staffId,
                appointment_date,
                appointment_time: selectedTime,
                status: 'booked',
                paymentStatus: 'paid',
                id: {
                    [Op.ne]: appointment.id
                }
            }
        });

        if (conflict) {
            await t.rollback();
            return res.status(409).json({ message: "slot already booked" });
        }

        appointment.staffId = staffId;
        appointment.appointment_date = appointment_date;
        appointment.appointment_time = selectedTime;
        appointment.reminder_sent = false;

        await appointment.save({ transaction: t });
        await t.commit();

        res.status(200).json({
            message: "appointment updated successfully",
            appointment
        });

    } catch (error) {
        console.log("ADMIN RESCHEDULE ERROR --->", error);
        await t.rollback();
        throw error;
    }
});

module.exports = {
    markAppointmentCompleted,
    cancelAppointmentByAdmin,
    getEditAppointmentPage,
    getAppointmentDataForAdmin,
    getAvailableSlotsForAdmin,
    rescheduleAppointmentByAdmin
};
