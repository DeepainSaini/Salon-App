const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Staff, Reviews, Appointments, Services, Users } = require('../models');
const { sequelize } = require('../models');
const asyncHandler = require('../util/asyncHandler');
const { config } = require('../config/appConfig');

const getStaffLoginPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'staffLogin.html'));
};

const staffLogin = asyncHandler(async (req, res) => {
  
    
  const { email, password } = req.body;

  const staff = await Staff.findOne({
    where: { email }
  });

  if (!staff) {
    return res.status(404).json({
      message: 'staff not found'
    });
  }

  if (!staff.is_active) {
      return res.status(403).json({
          message: "staff account is inactive"
      });
  }

  const isMatch = await bcrypt.compare(password, staff.password);

  if (!isMatch) {
    return res.status(401).json({
      message: 'incorrect password'
    });
  }

  const token = jwt.sign(
    {
      staffId: staff.id,
      role: 'staff'
    },
    config.auth.jwtSecret
  );

  res.cookie('staffToken', token, {
    httpOnly: true,
    secure: config.auth.cookieSecure,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });

  res.status(200).json({
      message: 'staff logged in',
      token,
      staffName: staff.name,
      mustChangePassword: staff.mustChangePassword
  });

});

const getStaffDashboardPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'staffDashboard.html'));
};

const getStaffAppointments = asyncHandler(async (req, res) => {


  if (req.staff.mustChangePassword) {
      return res.status(403).json({
          message: 'Please change your password first'
      });
  }
  const today = new Date().toISOString().slice(0, 10);

  const appointments = await Appointments.findAll({
    where: {
      staffId: req.staff.id,
      paymentStatus: 'paid'
    },
    include: [
      { model: Services, as: 'service' },
      { model: Users, as: 'customer' }
    ],
    order: [['appointment_date', 'ASC'], ['appointment_time', 'ASC']]
  });

  const todayAppointments = [];
  const upcomingAppointments = [];
  const completedAppointments = [];

  appointments.forEach((appointment) => {
    if (appointment.status === 'completed') {
      completedAppointments.push(appointment);
    } else if (appointment.status === 'booked' && appointment.appointment_date === today) {
      todayAppointments.push(appointment);
    } else if (appointment.status === 'booked' && appointment.appointment_date > today) {
      upcomingAppointments.push(appointment);
    }
  });

  res.status(200).json({
    todayAppointments,
    upcomingAppointments,
    completedAppointments
  });

});

const getStaffReviews = asyncHandler(async (req, res) => {


  if (req.staff.mustChangePassword) {
      return res.status(403).json({
          message: 'Please change your password first'
      });
  }
  const reviews = await Reviews.findAll({
    include: [
      {
        model: Appointments,
        as: 'appointment',
        where: {
          staffId: req.staff.id,
          status: 'completed',
          paymentStatus: 'paid'
        },
        include: [
          { model: Services, as: 'service' },
          { model: Users, as: 'customer' }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(200).json({
    reviews
  });

});

const respondToReview = asyncHandler(async (req, res) => {
  
  const t = await sequelize.transaction();
  try {

    const { id } = req.params;
    const { staffResponse } = req.body;

    if (!staffResponse || !staffResponse.trim()) {
      await t.rollback();
      return res.status(400).json({
        message: 'Response is required'
      });
    }

    const review = await Reviews.findOne({
      where: { id },
      include: [
        {
          model: Appointments,
          as: 'appointment',
          where: {
            staffId: req.staff.id
          }
        }
      ], transaction:t
    });

    if (!review) {
      await t.rollback();
      return res.status(404).json({
        message: 'Review not found'
      });
    }

    review.staffResponse = staffResponse.trim();
    review.respondedAt = new Date();

    await review.save({transaction:t});
    await t.commit();
    res.status(200).json({
      message: 'Response added successfully',
      review
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
});

const getStaffChangePasswordPage = (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'views', 'staffChangePassword.html'));
};

const changeStaffPassword = asyncHandler(async (req, res) => {

  const t = await sequelize.transaction();
  try {

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      await t.rollback();
      return res.status(400).json({
        message: 'old password and new password are required'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, req.staff.password);

    if (!isMatch) {
      await t.rollback();
      return res.status(401).json({
        message: 'old password is incorrect'
      });
    }

    req.staff.password = await bcrypt.hash(newPassword, 10);
    req.staff.mustChangePassword = false;

    await req.staff.save({transaction:t});
    await t.commit();
    res.status(200).json({
      message: 'password changed successfully'
    });

  } catch (error) {
    await t.rollback();
    throw error;
  }
});

const staffLogout = asyncHandler(async (req, res) => {
  res.clearCookie('staffToken');

  res.status(200).json({
    message: 'staff logged out'
  });
});



module.exports = {
  getStaffLoginPage,
  staffLogin,
  getStaffDashboardPage,
  getStaffReviews,
  respondToReview,
  staffLogout,
  getStaffAppointments,
  getStaffChangePasswordPage,
  changeStaffPassword
};
