const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profileController');
const userAuthentication = require('../middlewares/auth');
const { requireFields } = require('../middlewares/validateRequest');
const { requireCustomer } = require('../middlewares/authorise');

router.use(userAuthentication.authenticate);
router.use(requireCustomer);

router.get('/profile', profileController.getProfilePage);
router.post(
    '/profile',
    requireFields(['phone', 'notification_preference']),
    profileController.postProfileDetails
);

router.get('/profile/edit', profileController.getEditProfilePage);
router.get('/profile/data', profileController.getProfileData);
router.patch(
    '/profile/update',
    requireFields(['name', 'phone', 'notification_preference']),
    profileController.updateProfile
);

module.exports = router;
