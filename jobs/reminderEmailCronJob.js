const cron = require('node-cron');
const { Op } = require('sequelize');
const { Appointments, Users, Salons, Services, Staff } = require('../models');
const { sendAppointmentReminderEmail } = require('../util/services/emailServices');

function getAppointmentDateTime(appointment) {
    return new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
}

const startReminderCron = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log("Checking appointment reminders...");

            const now = new Date();
            const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            const appointments = await Appointments.findAll({
                where: {
                    status: 'booked',
                    reminder_sent: false
                },
                include: [
                    { model: Users, as: 'customer' },
                    { model: Salons, as: 'salon' },
                    { model: Services, as: 'service' },
                    { model: Staff, as: 'staff' }
                ]
            });

            for (const appointment of appointments) {
                const appointmentDateTime = getAppointmentDateTime(appointment);

                if (appointmentDateTime > now && appointmentDateTime <= next24Hours) {
                    await sendAppointmentReminderEmail(appointment.customer.email, {
                        salonName: appointment.salon.name,
                        serviceName: appointment.service.name,
                        staffName: appointment.staff.name,
                        date: appointment.appointment_date,
                        time: appointment.appointment_time
                    });

                    appointment.reminder_sent = true;
                    await appointment.save();
                }
            }

        } catch (error) {
            console.log("REMINDER CRON ERROR ---> ", error);
        }
    });
};

module.exports = {
    startReminderCron
};