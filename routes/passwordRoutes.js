const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middlewares/rateLimiter');

const passwordController = require('../controllers/passwordController');
const userAuthentication = require('../middlewares/auth');
const { requireFields, requireParams, requireStrongPassword } = require('../middlewares/validateRequest');
const { requireRole } = require('../middlewares/authorise');

const requireUserAccount = requireRole(['Admin', 'Customer']);

router.get('/change-password', userAuthentication.authenticate, requireUserAccount, passwordController.getChangePasswordPage);
router.patch(
    '/change-password',
    userAuthentication.authenticate,
    requireUserAccount,
    requireFields(['oldPassword', 'newPassword']),
    requireStrongPassword('newPassword'),
    passwordController.changePassword
);

router.get('/forgot-password', passwordController.getForgotPasswordPage);
router.post('/forgot-password', authLimiter, requireFields(['email']), passwordController.handleForgotPassword);

router.get('/reset-password/:id', requireParams(['id']), passwordController.getResetPasswordPage);
router.post(
    '/reset-password/:id',
    authLimiter,
    requireParams(['id']),
    requireFields(['newPassword']),
    requireStrongPassword('newPassword'),
    passwordController.resetPassword
);

module.exports = router;
