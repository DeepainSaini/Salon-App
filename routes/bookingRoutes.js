const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const userAuthentication = require('../middlewares/auth');

router.get('/bookAppointment', userAuthentication.authenticate, bookingController.getBookAppointmentPage);
router.get('/available-slots', userAuthentication.authenticate, bookingController.getAvailableSlots);
router.post('/bookAppointment', userAuthentication.authenticate, bookingController.postBookAppointment);
router.patch('/appointments/reschedule', userAuthentication.authenticate, bookingController.rescheduleAppointment);



module.exports = router;