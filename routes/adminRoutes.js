const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
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
router.patch('/reviews/:id/response',userAuthentication.authenticate,adminController.respondToReview);


module.exports = router;
