const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const adminController = require('../controllers/adminController');
const userAuthentication = require('../middlewares/auth');


router.get('/review', userAuthentication.authenticate, reviewController.getReviewForm);
router.post('/review', userAuthentication.authenticate, reviewController.postReview);
router.patch('/reviews/:id', userAuthentication.authenticate, reviewController.editReview);
router.delete('/reviews/:id', userAuthentication.authenticate, reviewController.deleteReview);

module.exports = router;