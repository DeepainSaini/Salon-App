const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const userAuthentication = require('../middlewares/auth');
const { requireParams } = require('../middlewares/validateRequest');
const { requireCustomer } = require('../middlewares/authorise');



router.get('/status/:orderId', userAuthentication.authenticate, requireCustomer, requireParams(['orderId']), paymentController.paymentStatus);

module.exports = router;
