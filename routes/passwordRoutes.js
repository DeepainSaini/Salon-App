const express = require('express');
const router = express.Router();

const passwordController = require('../controllers/passwordController');
const userAuthentication = require('../middlewares/auth');

router.get('/change-password', userAuthentication.authenticate, passwordController.getChangePasswordPage);
router.patch('/change-password', userAuthentication.authenticate, passwordController.changePassword);

router.get('/forgot-password', passwordController.getForgotPasswordPage);
router.post('/forgot-password', passwordController.handleForgotPassword);

router.get('/reset-password/:id', passwordController.getResetPasswordPage);
router.post('/reset-password/:id', passwordController.resetPassword);

module.exports = router;