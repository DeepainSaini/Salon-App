const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {Users,Salons,PasswordReq} = require('../models');
const {Sequelize,DataTypes, where,Op} = require('sequelize');
const { sequelize } = require('../models');
const { sendForgotPasswordEmail } = require('../util/services/emailServices');
const { randomUUID } = require('crypto');



const getChangePasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'changePassword.html'));
};

const changePassword = async (req, res) => {
  try {
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

  } catch (error) {
    console.log("CHANGE PASSWORD ERROR --->", error);
    res.status(500).json({
      message: "something went wrong"
    });
  }
};

const getForgotPasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'forgotPassword.html'));
};

const handleForgotPassword = async (req, res) => {
  try {
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

  } catch (error) {
    console.log("FORGOT PASSWORD ERROR --->", error);
    res.status(500).json({
      message: 'Failed to send email'
    });
  }
};

const getResetPasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'resetPassword.html'));
};

const resetPassword = async (req, res) => {
  try {
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

  } catch (error) {
    console.log("RESET PASSWORD ERROR --->", error);
    res.status(500).json({
      message: 'Could not reset password'
    });
  }
};


module.exports = {

    changePassword,
    getChangePasswordPage,
    handleForgotPassword,
    getResetPasswordPage,
    resetPassword,
    getForgotPasswordPage
}


