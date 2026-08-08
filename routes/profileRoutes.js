const express = require('express');
const router = express.Router();

const profileController = require('../controllers/profileController');
const userAuthentication = require('../middlewares/auth');

router.get('/profile', userAuthentication.authenticate, profileController.getProfilePage);
router.post('/profile', userAuthentication.authenticate, profileController.postProfileDetails);

router.get('/profile/edit', userAuthentication.authenticate, profileController.getEditProfilePage);
router.get('/profile/data', userAuthentication.authenticate, profileController.getProfileData);
router.patch('/profile/update', userAuthentication.authenticate, profileController.updateProfile);

module.exports = router;