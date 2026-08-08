const express = require('express');
const router = express.Router();
const userController = require('../controllers/customerController');
const bookingController = require('../controllers/bookingController');
const paymentController = require('../controllers/paymentController');
const userAuthentication = require('../middlewares/auth');



router.get('/status/:orderId',userAuthentication.authenticate,paymentController.paymentStatus);

module.exports = router;