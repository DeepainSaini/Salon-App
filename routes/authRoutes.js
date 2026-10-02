const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userAuthentication = require('../middlewares/auth');
const { requireFields, requireStrongPassword } = require('../middlewares/validateRequest');
const { authLimiter } = require('../middlewares/rateLimiter');

router.get('/signup', authController.getSignUpForm);
router.post('/signup', authLimiter, requireFields(['name', 'email', 'password', 'role']), requireStrongPassword('password'), authController.postUserDetails);

router.get('/login', authController.getLoginForm);
router.post('/login', authLimiter, requireFields(['email', 'password']), authController.validateUser);

router.post('/logout', userAuthentication.authenticate, authController.logout);


module.exports = router;
