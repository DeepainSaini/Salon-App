const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewController');
const userAuthentication = require('../middlewares/auth');
const { requireFields, requireRatingRange, requireParams } = require('../middlewares/validateRequest');
const { requireCustomer } = require('../middlewares/authorise');

router.use(userAuthentication.authenticate);
router.use(requireCustomer);

router.get('/review', reviewController.getReviewForm);
router.post(
    '/review',
    requireFields(['appointmentId', 'rating', 'comment']),
    requireRatingRange('rating'),
    reviewController.postReview
);

router.patch(
    '/reviews/:id',
    requireParams(['id']),
    requireFields(['rating', 'comment']),
    requireRatingRange('rating'),
    reviewController.editReview
);

router.delete(
    '/reviews/:id',
    requireParams(['id']),
    reviewController.deleteReview
);

module.exports = router;
