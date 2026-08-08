const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const serviceController = require('../controllers/serviceController');
const userAuthentication = require('../middlewares/auth');

router.get('/salonDetails',userAuthentication.authenticate,adminController.getAdminDetailsForm);
router.post('/salonDetails',userAuthentication.authenticate,adminController.postSalonDetails);
router.get('/dashboard',userAuthentication.authenticate,adminController.getAdminDashboard);
router.get('/dashboard-data',userAuthentication.authenticate,adminController.getAdminDashboardData);
router.get('/add-services',userAuthentication.authenticate,adminController.getAddServiceForm);
router.post('/add-services',userAuthentication.authenticate,adminController.postAddedService);
router.patch('/services/:id/status',userAuthentication.authenticate,adminController.changeServiceStatus);
router.get('/add-staff',userAuthentication.authenticate,adminController.getAddStaffForm);
router.get('/data-for-staff',userAuthentication.authenticate,adminController.getDataForStaffForm);
router.post('/addStaff',userAuthentication.authenticate,adminController.postAddStaff);
router.patch('/appointments/:id/complete',userAuthentication.authenticate,adminController.markAppointmentCompleted);
router.patch('/staff/:id/status', userAuthentication.authenticate, adminController.changeStaffStatus);
router.get('/services/:id/edit', userAuthentication.authenticate, serviceController.getEditServicePage);
router.get('/services/:id/data', userAuthentication.authenticate, serviceController.getServiceData);
router.patch('/services/:id', userAuthentication.authenticate, serviceController.updateService);
router.patch('/appointments/:id/cancel', userAuthentication.authenticate, adminController.cancelAppointmentByAdmin);
router.get('/appointments/:id/edit', userAuthentication.authenticate, adminController.getEditAppointmentPage);
router.get('/appointments/:id/data', userAuthentication.authenticate, adminController.getAppointmentDataForAdmin);
router.get('/appointments/:id/available-slots', userAuthentication.authenticate, adminController.getAvailableSlotsForAdmin);
router.patch('/appointments/:id/reschedule', userAuthentication.authenticate, adminController.rescheduleAppointmentByAdmin);
router.get('/customers/:id', userAuthentication.authenticate, adminController.getCustomerDetailsPage);
router.get('/customers/:id/data', userAuthentication.authenticate, adminController.getCustomerDetailsData);
router.get('/salonDetails/edit', userAuthentication.authenticate, adminController.getEditSalonDetailsPage);
router.get('/salonDetails/data', userAuthentication.authenticate, adminController.getSalonDetailsData);
router.patch('/salonDetails', userAuthentication.authenticate, adminController.updateSalonDetails);


module.exports = router;
