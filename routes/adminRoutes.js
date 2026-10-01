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

router.get('/salonDetails',userAuthentication.authenticate,adminSalonController.getAdminDetailsForm);
router.post('/salonDetails',userAuthentication.authenticate,adminSalonController.postSalonDetails);
router.get('/dashboard',userAuthentication.authenticate,adminDashboardController.getAdminDashboard);
router.get('/dashboard-data',userAuthentication.authenticate,adminDashboardController.getAdminDashboardData);
router.get('/add-services',userAuthentication.authenticate,adminServiceController.getAddServiceForm);
router.post('/add-services',userAuthentication.authenticate,adminServiceController.postAddedService);
router.patch('/services/:id/status',userAuthentication.authenticate,adminServiceController.changeServiceStatus);
router.get('/add-staff',userAuthentication.authenticate,adminStaffController.getAddStaffForm);
router.get('/data-for-staff',userAuthentication.authenticate,adminStaffController.getDataForStaffForm);
router.post('/addStaff',userAuthentication.authenticate,adminStaffController.postAddStaff);
router.patch('/appointments/:id/complete',userAuthentication.authenticate,adminAppointmentController.markAppointmentCompleted);
router.patch('/staff/:id/status', userAuthentication.authenticate, adminStaffController.changeStaffStatus);
router.get('/services/:id/edit', userAuthentication.authenticate, serviceController.getEditServicePage);
router.get('/services/:id/data', userAuthentication.authenticate, serviceController.getServiceData);
router.patch('/services/:id', userAuthentication.authenticate, serviceController.updateService);
router.patch('/appointments/:id/cancel', userAuthentication.authenticate, adminAppointmentController.cancelAppointmentByAdmin);
router.get('/appointments/:id/edit', userAuthentication.authenticate, adminAppointmentController.getEditAppointmentPage);
router.get('/appointments/:id/data', userAuthentication.authenticate, adminAppointmentController.getAppointmentDataForAdmin);
router.get('/appointments/:id/available-slots', userAuthentication.authenticate, adminAppointmentController.getAvailableSlotsForAdmin);
router.patch('/appointments/:id/reschedule', userAuthentication.authenticate, adminAppointmentController.rescheduleAppointmentByAdmin);
router.get('/customers/:id', userAuthentication.authenticate, adminCustomerController.getCustomerDetailsPage);
router.get('/customers/:id/data', userAuthentication.authenticate, adminCustomerController.getCustomerDetailsData);
router.get('/salonDetails/edit', userAuthentication.authenticate, adminSalonController.getEditSalonDetailsPage);
router.get('/salonDetails/data', userAuthentication.authenticate, adminSalonController.getSalonDetailsData);
router.patch('/salonDetails', userAuthentication.authenticate, adminSalonController.updateSalonDetails);


module.exports = router;
