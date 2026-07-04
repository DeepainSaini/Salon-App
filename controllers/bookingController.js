const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Staff,Appointments} = require('../models');
const {Sequelize,DataTypes, where} = require('sequelize');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { sendBookingConfirmationEmail } = require('../util/services/emailServices');
const { createOrder, getPaymentStatus } = require('../util/services/cashfreeServices');

function timeToMinutes(time) {
    const [hours, minutes] = time.slice(0, 5).split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

const getBookAppointmentPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../', 'views', 'bookAppointment.html'));
};


const getAvailableSlots = async (req, res) => {

    try {
        const { salonId, serviceId, date } = req.query;

        if (!salonId || !serviceId || !date) {
            return res.status(400).json({
                message: "salonId, serviceId and date are required"
            });
        }

        const service = await Services.findOne({
            where: {
                id: serviceId,
                salonId: salonId,
                is_active: true
            }
        });

        if (!service) {
            return res.status(404).json({
                message: "service not found"
            });
        }

        const staffList = await Staff.findAll({
            where: {
                salonId: salonId,
                serviceId: serviceId
            }
        });

        if (staffList.length === 0) {
            return res.status(200).json({
                slots: []
            });
        }

        const bookedAppointments = await Appointments.findAll({
            where: {
                salonId: salonId,
                serviceId: serviceId,
                appointment_date: date,
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        });

        const bookedSlots = bookedAppointments.map((appointment) => {
            return `${appointment.staffId}-${appointment.appointment_time.slice(0, 5)}`;
        });

        const slots = [];

        const today = new Date().toISOString().slice(0, 10);
        const currentTime = new Date().toTimeString().slice(0, 5);

        staffList.forEach((staff) => {
            const startMinutes = timeToMinutes(staff.available_from);
            const endMinutes = timeToMinutes(staff.available_to);
            const duration = Number(service.duration);

            for (let time = startMinutes; time + duration <= endMinutes; time += duration) {
                const slotTime = minutesToTime(time);

                if (date === today && slotTime <= currentTime) {
                    continue;
                }

                const slotKey = `${staff.id}-${slotTime}`;

                if (!bookedSlots.includes(slotKey)) {
                    slots.push({
                        time: slotTime,
                        staffId: staff.id,
                        staffName: staff.name
                    });
                }
            }
        });

        res.status(200).json({
            slots: slots
        });

    } catch (error) {
        console.log("ERROR GETTING AVAILABLE SLOTS ---> ", error);
        res.status(500).json({
            message: "something went wrong"
        });
    }
};

const postBookAppointment = async (req, res) => {
    
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
            return res.status(404).json({
                message: "service not found"
            });
        }

        const staff = await Staff.findOne({
            where: {
                id: staffId,
                salonId: salonId,
                serviceId: serviceId
            }
        });

        if (!staff) {
            return res.status(404).json({
                message: "staff not found for this service"
            });
        }

        const selectedTime = appointment_time.slice(0, 5);
        const staffStart = staff.available_from.slice(0, 5);
        const staffEnd = staff.available_to.slice(0, 5);

        if (selectedTime < staffStart || selectedTime >= staffEnd) {
            return res.status(400).json({
                message: "selected time is outside staff availability"
            });
        }

        const existingAppointment = await Appointments.findOne({
            where: {
                staffId: staffId,
                appointment_date: appointment_date,
                appointment_time: selectedTime,
                status: {
                    [Op.ne]: 'cancelled'
                }
            }
        });

        if (existingAppointment) {
            return res.status(409).json({
                message: "This slot is already booked"
            });
        }

        const orderId = "ORDER-" + Date.now();
        const paymentSessionId = await createOrder(
            orderId,
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
            status: 'booked',
            paymentStatus: 'pending',
            orderId,
            paymentSessionId

        },{transaction: t});

        const salon = await Salons.findByPk(salonId);

            if (!salon) {
                return res.status(404).json({
                    message: "salon not found"
                });
        }


        
        await t.commit();

        res.status(201).json({
            message: "appointment booked successfully",
            appointment: appointment,
            orderId,
            paymentSessionId
        });

    } catch (error) {
        console.log("ERROR BOOKING APPOINTMENT ---> ", error);
        await t.rollback();
        res.status(500).json({
            message: "something went wrong"
        });
    }
};




module.exports = {
    getBookAppointmentPage,
    getAvailableSlots,
    postBookAppointment
}