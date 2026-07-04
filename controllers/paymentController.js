const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,Services,Staff,Appointments} = require('../models');
const {Sequelize,DataTypes, where} = require('sequelize');
const { Op } = require('sequelize');
const { sequelize } = require('../models');
const { sendBookingConfirmationEmail } = require('../util/services/emailServices');
const { createOrder, getPaymentStatus } = require('../util/services/cashfreeServices');

const paymentStatus = async (req, res) => {
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
            return res.status(404).json({
                message: "appointment not found"
            });
        }

        appointment.paymentStatus = status;
        await appointment.save();

        if (status === 'paid') {
            await sendBookingConfirmationEmail(req.user.email, {
                salonName: appointment.salon.name,
                serviceName: appointment.service.name,
                staffName: appointment.staff.name,
                date: appointment.appointment_date,
                time: appointment.appointment_time
            });
        }

        res.redirect('/user/dashboard');

    } catch (error) {
        console.log("PAYMENT STATUS ERROR ---> ", error);
        res.status(500).json({
            message: "payment status error"
        });
    }
};