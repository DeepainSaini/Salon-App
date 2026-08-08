const Sib = require('sib-api-v3-sdk');
require('dotenv').config();

const client = Sib.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

const sendBookingConfirmationEmail = async (email, appointmentDetails) => {
    try {
        const tranEmailApi = new Sib.TransactionalEmailsApi();

        await tranEmailApi.sendTransacEmail({
            sender: {
                email: 'deepainsaini111@gmail.com',
                name: 'Salon Appointment App'
            },
            to: [{ email }],
            subject: 'Appointment Booking Confirmation',
            htmlContent: `
                <h2>Your appointment is confirmed</h2>
                <p>Your salon appointment has been booked successfully.</p>

                <p><strong>Salon:</strong> ${appointmentDetails.salonName}</p>
                <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                <p><strong>Staff:</strong> ${appointmentDetails.staffName}</p>
                <p><strong>Date:</strong> ${appointmentDetails.date}</p>
                <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            `
        });

        console.log("Booking confirmation email sent");

    } catch (error) {
        console.log("ERROR SENDING BOOKING EMAIL ---> ", error);
    }
};

const sendAppointmentReminderEmail = async (email, appointmentDetails) => {
    try {
        const tranEmailApi = new Sib.TransactionalEmailsApi();

        await tranEmailApi.sendTransacEmail({
            sender: {
                email: 'deepainsaini111@gmail.com',
                name: 'Salon Appointment App'
            },
            to: [{ email }],
            subject: 'Appointment Reminder',
            htmlContent: `
                <h2>Appointment Reminder</h2>
                <p>This is a reminder for your upcoming appointment.</p>

                <p><strong>Salon:</strong> ${appointmentDetails.salonName}</p>
                <p><strong>Service:</strong> ${appointmentDetails.serviceName}</p>
                <p><strong>Staff:</strong> ${appointmentDetails.staffName}</p>
                <p><strong>Date:</strong> ${appointmentDetails.date}</p>
                <p><strong>Time:</strong> ${appointmentDetails.time}</p>
            `
        });

        console.log("Reminder email sent");

    } catch (error) {
        console.log("ERROR SENDING REMINDER EMAIL ---> ", error.response?.text || error.message);
    }
};

const sendForgotPasswordEmail = async (email, resetLink) => {
  const tranEmailApi = new Sib.TransactionalEmailsApi();

  await tranEmailApi.sendTransacEmail({
    sender: {
      email: 'deepainsaini111@gmail.com',
      name: 'Salon Appointment App'
    },
    to: [
      {
        email: email
      }
    ],
    subject: 'Reset your password',
    htmlContent: `
      <h3>Password Reset Request</h3>
      <p>Click the link below to reset your password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>This link will expire in 15 minutes.</p>
    `
  });
};

module.exports = {
    sendBookingConfirmationEmail,
    sendAppointmentReminderEmail,
    sendForgotPasswordEmail
};