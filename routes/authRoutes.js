const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userAuthentication = require('../middlewares/auth');

router.get('/signup', authController.getSignUpForm);
router.post('/signup', authController.postUserDetails);

router.get('/login', authController.getLoginForm);
router.post('/login', authController.validateUser);

router.post('/logout', userAuthentication.authenticate, authController.logout);


module.exports = router;