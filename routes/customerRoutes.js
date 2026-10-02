const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const userAuthentication = require('../middlewares/auth');
const { requireParams } = require('../middlewares/validateRequest');
const { requireCustomer } = require('../middlewares/authorise');

router.use(userAuthentication.authenticate);
router.use(requireCustomer);

router.get('/dashboard', customerController.getCustomerDashboard);
router.get('/dashboard-data', customerController.getDashboardData);
router.get('/salon/:salonId', requireParams(['salonId']), customerController.getSalonServicesPage);
router.get('/salon/:salonId/services', requireParams(['salonId']), customerController.getSalonServices);
router.get('/my-appointments', customerController.getMyAppointments);
router.patch('/appointments/:id/cancel', requireParams(['id']), customerController.cancelAppointment);




module.exports = router;
