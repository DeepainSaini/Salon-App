const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const userAuthentication = require('../middlewares/auth');
const { requireFields, requireQuery } = require('../middlewares/validateRequest');
const { requireCustomer } = require('../middlewares/authorise');

router.use(userAuthentication.authenticate);
router.use(requireCustomer);

router.get('/bookAppointment', bookingController.getBookAppointmentPage);
router.get(
    '/available-slots',
    requireQuery(['salonId', 'serviceId', 'date']),
    bookingController.getAvailableSlots
);
router.post(
    '/bookAppointment',
    requireFields(['salonId', 'serviceId', 'staffId', 'appointment_date', 'appointment_time']),
    bookingController.postBookAppointment
);

router.patch(
    '/appointments/reschedule',
    requireFields(['appointmentId', 'staffId', 'appointment_date', 'appointment_time']),
    bookingController.rescheduleAppointment
);



module.exports = router;
