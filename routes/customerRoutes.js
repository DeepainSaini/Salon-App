const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const userAuthentication = require('../middlewares/auth');

router.get('/dashboard',userAuthentication.authenticate,customerController.getCustomerDashboard);
router.get('/dashboard-data',userAuthentication.authenticate,customerController.getDashboardData);
router.get('/salon/:salonId',userAuthentication.authenticate,customerController.getSalonServicesPage);
router.get('/salon/:salonId/services',userAuthentication.authenticate, customerController.getSalonServices);
router.get('/my-appointments',userAuthentication.authenticate,customerController.getMyAppointments);
router.patch('/appointments/:id/cancel',userAuthentication.authenticate,customerController.cancelAppointment);




module.exports = router;