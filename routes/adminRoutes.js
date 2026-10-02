const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');
const serviceController = require('../controllers/serviceController');
const adminServiceController = require('../controllers/adminServiceController');
const adminStaffController = require('../controllers/adminStaffController');
const adminAppointmentController = require('../controllers/adminAppointmentController');
const adminCustomerController = require('../controllers/adminCustomerController');
const adminSalonController = require('../controllers/adminSalonController');
const userAuthentication = require('../middlewares/auth');
const { requireFields, requireArrayField, requireParams, requireQuery, requireStrongPassword } = require('../middlewares/validateRequest');
const { requireAdmin } = require('../middlewares/authorise');

router.use(userAuthentication.authenticate);
router.use(requireAdmin);

router.get('/salonDetails', adminSalonController.getAdminDetailsForm);
router.post(
    '/salonDetails',
    requireFields(['name', 'description', 'email', 'address', 'zipcode', 'city', 'phone', 'open_time', 'close_time']),
    adminSalonController.postSalonDetails
);
router.get('/dashboard', adminDashboardController.getAdminDashboard);
router.get('/dashboard-data', adminDashboardController.getAdminDashboardData);
router.get('/add-services', adminServiceController.getAddServiceForm);
router.post(
    '/add-services',
    requireFields(['name', 'description', 'price', 'duration', 'available_from', 'available_to']),
    adminServiceController.postAddedService
);
router.patch('/services/:id/status', requireParams(['id']), adminServiceController.changeServiceStatus);
router.get('/add-staff', adminStaffController.getAddStaffForm);
router.get('/data-for-staff', adminStaffController.getDataForStaffForm);
router.post(
    '/addStaff',
    requireFields(['name', 'phone', 'email', 'specialization', 'available_from', 'available_to', 'password']),
    requireStrongPassword('password'),
    requireArrayField('serviceIds'),
    adminStaffController.postAddStaff
);
router.patch('/appointments/:id/complete', requireParams(['id']), adminAppointmentController.markAppointmentCompleted);
router.patch('/staff/:id/status', requireParams(['id']), adminStaffController.changeStaffStatus);
router.get('/services/:id/edit', requireParams(['id']), serviceController.getEditServicePage);
router.get('/services/:id/data', requireParams(['id']), serviceController.getServiceData);
router.patch(
    '/services/:id',
    requireParams(['id']),
    requireFields(['name', 'description', 'price', 'duration', 'available_from', 'available_to']),
    serviceController.updateService
);
router.patch('/appointments/:id/cancel', requireParams(['id']), adminAppointmentController.cancelAppointmentByAdmin);
router.get('/appointments/:id/edit', requireParams(['id']), adminAppointmentController.getEditAppointmentPage);
router.get('/appointments/:id/data', requireParams(['id']), adminAppointmentController.getAppointmentDataForAdmin);
router.get(
    '/appointments/:id/available-slots',
    requireParams(['id']),
    requireQuery(['date']),
    adminAppointmentController.getAvailableSlotsForAdmin
);
router.patch(
    '/appointments/:id/reschedule',
    requireParams(['id']),
    requireFields(['staffId', 'appointment_date', 'appointment_time']),
    adminAppointmentController.rescheduleAppointmentByAdmin
);
router.get('/customers/:id', requireParams(['id']), adminCustomerController.getCustomerDetailsPage);
router.get('/customers/:id/data', requireParams(['id']), adminCustomerController.getCustomerDetailsData);
router.get('/salonDetails/edit', adminSalonController.getEditSalonDetailsPage);
router.get('/salonDetails/data', adminSalonController.getSalonDetailsData);
router.patch(
    '/salonDetails',
    requireFields(['name', 'description', 'email', 'address', 'zipcode', 'city', 'phone', 'open_time', 'close_time']),
    adminSalonController.updateSalonDetails
);


module.exports = router;
