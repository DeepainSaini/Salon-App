const express = require('express');
const router = express.Router();

const staffController = require('../controllers/staffController');
const staffAuth = require('../middlewares/staffAuth');

router.get('/login', staffController.getStaffLoginPage);
router.post('/login', staffController.staffLogin);

router.get('/dashboard', staffAuth.authenticateStaff, staffController.getStaffDashboardPage);
router.get('/reviews', staffAuth.authenticateStaff, staffController.getStaffReviews);
router.patch('/reviews/:id/response', staffAuth.authenticateStaff, staffController.respondToReview);
router.post('/logout', staffAuth.authenticateStaff, staffController.staffLogout);
router.get('/appointments', staffAuth.authenticateStaff, staffController.getStaffAppointments);
router.get('/change-password', staffAuth.authenticateStaff, staffController.getStaffChangePasswordPage);
router.patch('/change-password', staffAuth.authenticateStaff, staffController.changeStaffPassword);

module.exports = router;