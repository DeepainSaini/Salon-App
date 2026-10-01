const path = require('path');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');


const getProfilePage = (req,res) => {

    res.sendFile(path.join(__dirname,'../','views','userProfile.html'));
}

const postProfileDetails = asyncHandler(async (req,res) => {
       
    const t = await sequelize.transaction();

    try{
       
      const {phone,notification_preference,notes} = req.body;
      const user = req.user;
      user.phone = phone;
      user.notification_preference = notification_preference;
      user.notes = notes;
      user.profile_completed = true;
      await user.save({transaction:t});
      await t.commit();
      res.status(200).json({message:"user profile details updated"});

    }catch(error){
        
      await t.rollback();
      throw error;
        
    }
})

const getEditProfilePage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'editProfile.html'));
};

const getProfileData = asyncHandler(async (req, res) => {

  res.status(200).json({
    user: req.user
  });
});

const updateProfile = asyncHandler(async (req, res) => {

  const { name, phone, notification_preference, notes } = req.body;

  if (!name || !phone || !notification_preference) {
    return res.status(400).json({
      message: "name, phone and notification preference are required"
    });
  }

  if (!['email', 'sms'].includes(notification_preference)) {
    return res.status(400).json({
      message: "invalid notification preference"
    });
  }

  const user = req.user;

  user.name = name;
  user.phone = phone;
  user.notification_preference = notification_preference;
  user.notes = notes;
  user.profile_completed = true;

  await user.save();

  res.status(200).json({
    message: "profile updated successfully",
    user
  });

});




module.exports = {
  getProfilePage,
  postProfileDetails,
  getEditProfilePage,
  getProfileData,
  updateProfile,

};
