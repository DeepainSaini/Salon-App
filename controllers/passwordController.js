const path = require('path');
const bcrypt = require('bcrypt');
const { Users, PasswordReq } = require('../models');
const { sendForgotPasswordEmail } = require('../util/services/emailServices');
const { randomUUID } = require('crypto');
const asyncHandler = require('../util/asyncHandler');



const getChangePasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'changePassword.html'));
};

const changePassword = asyncHandler(async (req, res) => {

  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({
      message: "old password and new password are required"
    });
  }

  const user = req.user;

  const isMatch = await bcrypt.compare(oldPassword, user.password);

  if (!isMatch) {
    return res.status(401).json({
      message: "old password is incorrect"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  await user.save();

  res.status(200).json({
    message: "password changed successfully"
  });

});

const getForgotPasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'forgotPassword.html'));
};

const handleForgotPassword = asyncHandler(async (req, res) => {

  const { email } = req.body;

  const user = await Users.findOne({
    where: { email }
  });

  if (!user) {
    return res.status(404).json({
      message: 'Email not found'
    });
  }

  const id = randomUUID();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await PasswordReq.create({
    id,
    userId: user.id,
    isactive: true,
    expiresAt
  });

  const resetLink = `http://localhost:3000/user/reset-password/${id}`;

  await sendForgotPasswordEmail(email, resetLink);

  res.status(200).json({
    message: 'Reset email sent'
  });

});

const getResetPasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'resetPassword.html'));
};

const resetPassword = asyncHandler(async (req, res) => {

  const { id } = req.params;
  const { newPassword } = req.body;

  const passwordReq = await PasswordReq.findOne({
    where: {
      id,
      isactive: true
    }
  });

  if (!passwordReq) {
    return res.status(400).json({
      message: 'Invalid or expired reset link'
    });
  }

  if (passwordReq.expiresAt < new Date()) {
    passwordReq.isactive = false;
    await passwordReq.save();

    return res.status(400).json({
      message: 'Reset link expired'
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await Users.update(
    { password: hashedPassword },
    { where: { id: passwordReq.userId } }
  );

  passwordReq.isactive = false;
  await passwordReq.save();

  res.status(200).json({
    message: 'Password reset successful'
  });

});


module.exports = {

    changePassword,
    getChangePasswordPage,
    handleForgotPassword,
    getResetPasswordPage,
    resetPassword,
    getForgotPasswordPage
}


