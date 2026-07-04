const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const userAuthentication = require('../middlewares/auth');

router.get('/signup',userController.getSignUpForm);
router.post('/signup',userController.postUserDetails);
router.get('/login',userController.getLoginForm);
router.post('/login',userController.validateUser);
router.get('/profile',userAuthentication.authenticate,userController.getUserProfileForm);
router.post('/profile',userAuthentication.authenticate,userController.postUserProfileDetails);
router.get('/dashboard',userAuthentication.authenticate,userController.getCustomerDashboard);
router.get('/dashboard-data',userAuthentication.authenticate,userController.getDashboardData);
router.get('/salon/:salonId',userAuthentication.authenticate,userController.getSalonServicesPage);
router.get('/salon/:salonId/services',userAuthentication.authenticate, userController.getSalonServices);
router.get('/bookAppointment', userAuthentication.authenticate, bookingController.getBookAppointmentPage);
router.get('/available-slots',userAuthentication.authenticate,bookingController.getAvailableSlots);
router.post('/bookAppointment',userAuthentication.authenticate,bookingController.postBookAppointment);
router.get('/my-appointments',userAuthentication.authenticate,userController.getMyAppointments);
router.patch('/appointments/:id/cancel',userAuthentication.authenticate,userController.cancelAppointment);


module.exports = router;